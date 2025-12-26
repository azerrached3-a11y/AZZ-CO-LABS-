const axios = require('axios');
const promptManager = require('./promptManager');
const personaDetector = require('./personaDetector');

// AI Provider Configuration - ONLY Ollama with Qwen 2
const AI_PROVIDER = 'ollama'; // Fixed to Ollama only

// Ollama Configuration - Qwen 2
// On Vercel, we need a cloud service. Options:
// 1. OpenRouter (supports Qwen 2) - https://openrouter.ai
// 2. DeepSeek (supports Qwen 2) - https://api.deepseek.com
// 3. Custom Ollama cloud instance

const IS_VERCEL = !!process.env.VERCEL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || IS_VERCEL;

// For production/Vercel: Use OpenRouter or DeepSeek (both support Qwen 2)
// For local: Use localhost Ollama
let OLLAMA_API_URL, OLLAMA_MODEL, OLLAMA_API_KEY;

if (IS_PRODUCTION) {
    // Production: Use OpenRouter (supports Qwen 2) or DeepSeek
    // OpenRouter endpoint for Qwen 2
    OLLAMA_API_URL = process.env.OLLAMA_API_URL || process.env.OLLAMA_BASE_URL || 'https://openrouter.ai/api/v1';
    OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen/qwen-2.5-7b-instruct'; // Qwen 2 via OpenRouter
    OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || process.env.OPENROUTER_API_KEY || '5814484fb98c4ed0ac478de9935428fc.2ehRIt8p5BDvJjdzgzUrNc4_';
} else {
    // Local development: Use local Ollama
    OLLAMA_API_URL = process.env.OLLAMA_API_URL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2:latest';
    OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
}

const TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT) || 30000;

/**
 * Service for interacting with Ollama API (Qwen 2)
 */
class OllamaService {
    /**
     * Get API configuration for Ollama with Qwen 2
     */
    getApiConfig() {
        if (!OLLAMA_API_URL) {
            throw new Error('OLLAMA_API_URL not configured. Please set it in Vercel environment variables.');
        }
        
        if (!OLLAMA_MODEL) {
            throw new Error('OLLAMA_MODEL not configured. Please set it in Vercel environment variables.');
        }
        
        // Check if using OpenRouter (cloud service)
        const isOpenRouter = OLLAMA_API_URL.includes('openrouter.ai');
        const isLocal = OLLAMA_API_URL.includes('localhost') || OLLAMA_API_URL.includes('127.0.0.1');
        
        console.log(`🔑 Using ${isOpenRouter ? 'OpenRouter' : isLocal ? 'Local Ollama' : 'Ollama Cloud'}: ${OLLAMA_API_URL}`);
        console.log(`🤖 Using model: ${OLLAMA_MODEL}`);
        
        if (isOpenRouter) {
            // OpenRouter uses OpenAI-compatible format
            return {
                url: `${OLLAMA_API_URL}/chat/completions`,
                model: OLLAMA_MODEL,
                apiKey: OLLAMA_API_KEY || '',
                provider: 'ollama',
                format: 'openai' // OpenRouter uses OpenAI format
            };
        } else {
            // Native Ollama format (local or cloud)
            return {
                url: `${OLLAMA_API_URL}/api/generate`,
                model: OLLAMA_MODEL,
                apiKey: OLLAMA_API_KEY || '',
                provider: 'ollama',
                format: 'ollama'
            };
        }
    }

    /**
     * Get headers for API requests
     */
    getHeaders(apiConfig) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add API key if provided (for cloud Ollama services)
        if (apiConfig.apiKey && apiConfig.apiKey.trim() !== '') {
            headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
        }
        
        // OpenRouter requires additional headers
        if (OLLAMA_API_URL.includes('openrouter.ai')) {
            headers['HTTP-Referer'] = process.env.OPENROUTER_REFERER || 'https://azzcolabs.business';
            headers['X-Title'] = process.env.OPENROUTER_TITLE || 'AZZ&CO LABS';
        }
        
        return headers;
    }

    /**
     * Check if Ollama with Qwen 2 is available
     */
    async checkHealth() {
        try {
            const apiConfig = this.getApiConfig();
            const headers = this.getHeaders(apiConfig);
            
            // Test with a simple Ollama request
            const testResponse = await axios.post(
                apiConfig.url,
                {
                    model: apiConfig.model,
                    prompt: 'test',
                    stream: false
                },
                {
                    headers: headers,
                    timeout: 5000
                }
            );
            
            return { 
                available: true, 
                provider: 'ollama',
                model: apiConfig.model,
                url: OLLAMA_API_URL
            };
        } catch (error) {
            return { 
                available: false, 
                provider: 'ollama',
                model: OLLAMA_MODEL,
                error: error.message 
            };
        }
    }

    /**
     * Generate response using Ollama with Qwen 2
     */
    async generateResponse(userMessage, interactionHistory = [], visitorId = null) {
        let apiConfig = null;
        try {
            console.log('🤖 Generating response for:', userMessage.substring(0, 50));
            
            // Get API configuration
            apiConfig = this.getApiConfig();
            console.log('📡 Using provider:', apiConfig.provider);
            console.log('📡 Using model:', apiConfig.model);
            
            // Detect persona
            const personaDetection = personaDetector.detectPersona(userMessage, interactionHistory);
            const persona = personaDetection.persona;
            console.log('👤 Detected persona:', persona);
            
            // Extract context keywords
            const contextKeywords = personaDetector.extractContextKeywords(userMessage);
            console.log('🔑 Context keywords:', contextKeywords);
            
            // Get prompt
            const prompt = promptManager.getPrompt(contextKeywords, persona, userMessage);
            console.log('📝 Prompt length:', prompt.length);
            
            // Build full prompt for Ollama (system + user message)
            const systemPrompt = prompt.split('MESSAGE UTILISATEUR:')[0] || prompt;
            let fullPrompt = `${systemPrompt}\n\nMESSAGE UTILISATEUR: ${userMessage}`;
            
            // Add interaction history if available
            if (interactionHistory && interactionHistory.length > 0) {
                const historyText = interactionHistory.slice(-5).map(msg => {
                    const role = msg.role || 'user';
                    const content = msg.content || msg.message || '';
                    return `${role === 'assistant' ? 'ASSISTANT' : 'UTILISATEUR'}: ${content}`;
                }).join('\n');
                fullPrompt = `${fullPrompt}\n\nHISTORIQUE:\n${historyText}`;
            }
            
            // Call Ollama API
            if (!apiConfig) {
                throw new Error('Configuration API non disponible. Veuillez vérifier OLLAMA_API_URL dans Vercel.');
            }
            
            const headers = this.getHeaders(apiConfig);
            console.log('📡 Calling Ollama API with Qwen 2...');
            
            let response;
            let generatedText = '';
            
            if (apiConfig.format === 'openai') {
                // OpenRouter format (OpenAI-compatible)
                console.log('📡 Using OpenRouter (OpenAI-compatible) format');
                console.log('📡 URL:', apiConfig.url);
                console.log('📡 Model:', apiConfig.model);
                console.log('📡 Headers:', JSON.stringify(headers).replace(/Bearer [^\"]+/, 'Bearer ***'));
                
                const messages = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ];
                
                try {
                    response = await axios.post(
                        apiConfig.url,
                        {
                            model: apiConfig.model,
                            messages: messages,
                            temperature: 0.7,
                            max_tokens: 500
                        },
                        {
                            headers: headers,
                            timeout: TIMEOUT
                        }
                    );
                    
                    generatedText = response.data.choices?.[0]?.message?.content || '';
                    
                    if (!generatedText) {
                        console.error('❌ Empty response from OpenRouter:', JSON.stringify(response.data));
                        throw new Error('Réponse vide de OpenRouter. Vérifiez la clé API et le modèle.');
                    }
                } catch (openRouterError) {
                    console.error('❌ OpenRouter API Error:', openRouterError.message);
                    if (openRouterError.response) {
                        console.error('❌ Status:', openRouterError.response.status);
                        console.error('❌ Data:', JSON.stringify(openRouterError.response.data));
                    }
                    throw openRouterError;
                }
            } else {
                // Native Ollama format
                console.log('📡 Using native Ollama format');
                response = await axios.post(
                    apiConfig.url,
                    {
                        model: apiConfig.model,
                        prompt: fullPrompt,
                        stream: false,
                        options: {
                            temperature: 0.7,
                            top_p: 0.9,
                            top_k: 40
                        }
                    },
                    {
                        headers: headers,
                        timeout: TIMEOUT
                    }
                );
                
                generatedText = response.data.response || '';
            }
            
            console.log('✅ Ollama (Qwen 2) response received, length:', generatedText.length);
            
            const cleanedResponse = this.cleanResponse(generatedText);
            
            return {
                response: cleanedResponse,
                persona: persona,
                confidence: personaDetection.confidence,
                contextKeywords: contextKeywords,
                model: apiConfig.model,
                provider: apiConfig.provider
            };
        } catch (error) {
            console.error('❌ Ollama API Error:', error.message);
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', JSON.stringify(error.response.data).substring(0, 500));
            }
            
            // NO FALLBACK - Return error message instead
            let errorMessage = error.response?.data?.error?.message || error.message || 'Erreur inconnue';
            
            // More specific error messages
            if (error.response?.status === 401) {
                errorMessage = 'Clé API invalide. Vérifiez OLLAMA_API_KEY dans Vercel.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Modèle non trouvé. Vérifiez OLLAMA_MODEL (essayez: qwen/qwen-2.5-7b-instruct).';
            } else if (error.response?.status === 429) {
                errorMessage = 'Limite de taux dépassée. Attendez quelques instants.';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage = 'Impossible de se connecter à l\'API. Vérifiez OLLAMA_API_URL.';
            }
            
            const actualProvider = apiConfig?.provider || 'ollama';
            const actualModel = apiConfig?.model || OLLAMA_MODEL;
            
            throw new Error(`Erreur lors de l'appel à ${OLLAMA_API_URL.includes('openrouter') ? 'OpenRouter' : 'Ollama'} (${actualModel}): ${errorMessage}. Vérifiez vos variables d'environnement dans Vercel.`);
        }
    }

    /**
     * Clean and format response
     */
    cleanResponse(text) {
        // Remove any prompt artifacts
        let cleaned = text
            .replace(/RÉPONSE.*?:/gi, '')
            .replace(/MESSAGE UTILISATEUR.*?:/gi, '')
            .replace(/CONTEXTE.*?:/gi, '')
            .trim();

        // Remove excessive newlines
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

        // Ensure proper sentence endings
        if (!cleaned.match(/[.!?]$/)) {
            cleaned += '.';
        }

        return cleaned;
    }

}

module.exports = new OllamaService();