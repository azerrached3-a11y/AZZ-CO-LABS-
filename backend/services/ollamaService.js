const axios = require('axios');
const promptManager = require('./promptManager');
const personaDetector = require('./personaDetector');

// AI Provider Configuration - ONLY Ollama and DeepSeek (FREE models only)
const AI_PROVIDER = process.env.AI_PROVIDER || 'deepseek'; // deepseek or ollama

// DeepSeek (FREE - Default)
// Support multiple API keys for rotation and fallback
const DEEPSEEK_API_KEYS = [
    process.env.DEEPSEEK_API_KEY,
    process.env.DEEPSEEK_API_KEY_2,
    process.env.DEEPSEEK_API_KEY_3,
    process.env.DEEPSEEK_API_KEY_LEGACY,
    'sk-51049ef2af114b72a98c17837c393017' // Fallback default
].filter(key => key && key.trim() !== ''); // Remove empty keys

const DEEPSEEK_API_KEY = DEEPSEEK_API_KEYS[0] || null; // Primary key (for backward compatibility)
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'; // FREE model

// Key rotation index (for round-robin)
let currentKeyIndex = 0;

// Ollama (Local or Cloud - FREE)
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';

const TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT) || 30000;

/**
 * Service for interacting with Ollama API
 */
class OllamaService {
    /**
     * Get the next available DeepSeek API key (round-robin rotation)
     * @returns {string|null} API key or null if none available
     */
    getNextDeepSeekKey() {
        if (DEEPSEEK_API_KEYS.length === 0) {
            return null;
        }
        
        // Round-robin: cycle through all available keys
        const key = DEEPSEEK_API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % DEEPSEEK_API_KEYS.length;
        
        return key;
    }
    
    /**
     * Get API configuration based on provider (ONLY DeepSeek or Ollama - FREE models)
     */
    getApiConfig() {
        let provider = AI_PROVIDER.toLowerCase().trim();
        
        // Auto-convert deprecated providers to DeepSeek
        const deprecatedProviders = ['groq', 'openrouter', 'huggingface', 'hf', 'openai'];
        if (deprecatedProviders.includes(provider)) {
            console.warn(`⚠️  Provider "${provider}" is deprecated. Auto-converting to "deepseek". Please update AI_PROVIDER in Vercel to "deepseek".`);
            provider = 'deepseek';
        }
        
        if (provider === 'deepseek') {
            // Try to get an available key
            const apiKey = this.getNextDeepSeekKey();
            
            if (!apiKey) {
                throw new Error(`Aucune clé API DeepSeek configurée. ${DEEPSEEK_API_KEYS.length} clé(s) trouvée(s) dans l'environnement, mais aucune n'est valide. Veuillez vérifier DEEPSEEK_API_KEY dans Vercel.`);
            }
            
            console.log(`🔑 Using DeepSeek API key (${DEEPSEEK_API_KEYS.length} key(s) available, using key #${currentKeyIndex === 0 ? DEEPSEEK_API_KEYS.length : currentKeyIndex})`);
            
            return {
                url: `${DEEPSEEK_API_URL}/chat/completions`,
                model: DEEPSEEK_MODEL,
                apiKey: apiKey,
                provider: 'deepseek',
                format: 'openai',
                allKeys: DEEPSEEK_API_KEYS.length // For debugging
            };
        }
        
        if (provider === 'ollama') {
            // Check if Ollama URL is configured (can be localhost or cloud service)
            if (!OLLAMA_API_URL || OLLAMA_API_URL === 'http://localhost:11434') {
                throw new Error('OLLAMA_API_URL not configured for production. For Vercel, use a cloud Ollama service or set AI_PROVIDER=deepseek');
            }
            return {
                url: `${OLLAMA_API_URL}/api/generate`,
                model: OLLAMA_MODEL,
                apiKey: OLLAMA_API_KEY || '',
                provider: 'ollama',
                format: 'ollama'
            };
        }
        
        throw new Error(`Unknown AI provider: "${AI_PROVIDER}". Supported providers: deepseek, ollama. Please set AI_PROVIDER=deepseek in Vercel environment variables.`);
    }

    /**
     * Get headers for API requests
     */
    getHeaders(apiConfig) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.apiKey}`
        };
        
        // Add provider-specific headers
        if (apiConfig.headers) {
            Object.assign(headers, apiConfig.headers);
        }
        
        return headers;
    }

    /**
     * Check if AI provider is available
     */
    async checkHealth() {
        try {
            const apiConfig = this.getApiConfig();
            const headers = this.getHeaders(apiConfig);
            
            // Test with a simple request
            const testResponse = await axios.post(
                apiConfig.url,
                {
                    model: apiConfig.model,
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 5
                },
                {
                    headers: headers,
                    timeout: 5000
                }
            );
            
            return { 
                available: true, 
                provider: apiConfig.provider,
                model: apiConfig.model 
            };
        } catch (error) {
            return { 
                available: false, 
                provider: AI_PROVIDER,
                error: error.message 
            };
        }
    }

    /**
     * Generate response using AI provider (DeepSeek or Ollama - FREE models only)
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
            
            // Prepare system and user messages
            const systemPrompt = prompt.split('MESSAGE UTILISATEUR:')[0] || prompt;
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];
            
            // Add interaction history if available
            if (interactionHistory && interactionHistory.length > 0) {
                interactionHistory.slice(-5).forEach(msg => {
                    messages.push({
                        role: msg.role || 'user',
                        content: msg.content || msg.message
                    });
                });
            }
            
            // Call AI API (apiConfig is guaranteed to be defined here)
            if (!apiConfig) {
                throw new Error('Configuration API non disponible. Veuillez vérifier AI_PROVIDER dans Vercel.');
            }
            
            const headers = this.getHeaders(apiConfig);
            let response;
            
            if (apiConfig.format === 'ollama') {
                // Native Ollama format
                console.log('📡 Using Ollama native format');
                response = await axios.post(
                    apiConfig.url,
                    {
                        model: apiConfig.model,
                        prompt: prompt,
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
                
                const generatedText = response.data.response || '';
                console.log('✅ Ollama response received, length:', generatedText.length);
                
                const cleanedResponse = this.cleanResponse(generatedText);
                
                return {
                    response: cleanedResponse,
                    persona: persona,
                    confidence: personaDetection.confidence,
                    contextKeywords: contextKeywords,
                    model: apiConfig.model,
                    provider: apiConfig.provider
                };
            } else {
                // OpenAI-compatible format (DeepSeek)
                // Try all available keys if one fails
                let lastError = null;
                let triedKeys = 0;
                
                for (let attempt = 0; attempt < DEEPSEEK_API_KEYS.length; attempt++) {
                    try {
                        const currentKey = DEEPSEEK_API_KEYS[attempt];
                        console.log(`📡 Using OpenAI-compatible format (DeepSeek) - Attempt ${attempt + 1}/${DEEPSEEK_API_KEYS.length} with key #${attempt + 1}`);
                        
                        const currentHeaders = {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentKey}`
                        };
                        
                        response = await axios.post(
                            apiConfig.url,
                            {
                                model: apiConfig.model,
                                messages: messages,
                                temperature: 0.7,
                                max_tokens: 500
                            },
                            {
                                headers: currentHeaders,
                                timeout: TIMEOUT
                            }
                        );
                        
                        const generatedText = response.data.choices?.[0]?.message?.content || '';
                        console.log(`✅ DeepSeek response received (key #${attempt + 1} worked), length:`, generatedText.length);
                        
                        const cleanedResponse = this.cleanResponse(generatedText);
                        
                        return {
                            response: cleanedResponse,
                            persona: persona,
                            confidence: personaDetection.confidence,
                            contextKeywords: contextKeywords,
                            model: apiConfig.model,
                            provider: apiConfig.provider
                        };
                    } catch (keyError) {
                        triedKeys++;
                        lastError = keyError;
                        console.warn(`⚠️  Key #${attempt + 1} failed:`, keyError.response?.status || keyError.message);
                        
                        // If this is not the last key, try the next one
                        if (attempt < DEEPSEEK_API_KEYS.length - 1) {
                            console.log(`🔄 Retrying with next key...`);
                            continue;
                        }
                    }
                }
                
                // All keys failed
                throw new Error(`Toutes les clés DeepSeek ont échoué (${triedKeys}/${DEEPSEEK_API_KEYS.length} testées). Dernière erreur: ${lastError?.response?.status || lastError?.message || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('❌ AI API Error:', error.message);
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', JSON.stringify(error.response.data).substring(0, 500));
            }
            
            // NO FALLBACK - Return error message instead
            const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur inconnue';
            
            // Safely get provider name (apiConfig might not be defined if getApiConfig() failed)
            let actualProvider = AI_PROVIDER;
            if (apiConfig && apiConfig.provider) {
                actualProvider = apiConfig.provider;
            } else if (error.message && error.message.includes('Unknown AI provider')) {
                // If getApiConfig() failed due to unknown provider, extract it from error
                actualProvider = AI_PROVIDER;
            }
            
            throw new Error(`Erreur lors de l'appel à l'API ${actualProvider}: ${errorMessage}. Veuillez vérifier votre configuration API dans Vercel.`);
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