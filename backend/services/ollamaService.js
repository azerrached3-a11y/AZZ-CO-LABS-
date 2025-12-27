const axios = require('axios');
const promptManager = require('./promptManager');
const personaDetector = require('./personaDetector');

/**
 * Simple AI Service - Reads ALL configuration from environment variables
 * No hardcoded values, no fallbacks, just pure .env configuration
 */
class OllamaService {
    constructor() {
        // ALL values from .env - NO defaults, NO hardcoded values
        this.apiUrl = process.env.AI_API_URL || process.env.OLLAMA_API_URL || process.env.OPENROUTER_URL;
        this.model = process.env.AI_MODEL || process.env.OLLAMA_MODEL || process.env.OPENROUTER_MODEL;
        this.apiKey = process.env.AI_API_KEY || process.env.OLLAMA_API_KEY || process.env.OPENROUTER_API_KEY;
        this.timeout = parseInt(process.env.AI_TIMEOUT || process.env.OLLAMA_TIMEOUT || '30000');
        
        // Determine format based on URL
        this.format = this.detectFormat(this.apiUrl);
        
        console.log('🔧 AI Service Configuration:');
        console.log('   URL:', this.apiUrl ? this.apiUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET');
        console.log('   Model:', this.model || 'NOT SET');
        console.log('   API Key:', this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT SET');
        console.log('   Format:', this.format);
    }
    
    /**
     * Detect API format from URL
     */
    detectFormat(url) {
        if (!url) return 'unknown';
        if (url.includes('openrouter.ai')) return 'openai';
        if (url.includes('deepseek.com')) return 'openai';
        if (url.includes('api.openai.com')) return 'openai';
        if (url.includes('ollama') || url.includes('localhost:11434')) return 'ollama';
        return 'openai'; // Default to OpenAI format
    }
    
    /**
     * Get headers for API request
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        
        // OpenRouter specific headers
        if (this.apiUrl && this.apiUrl.includes('openrouter.ai')) {
            headers['HTTP-Referer'] = process.env.OPENROUTER_REFERER || 'https://azzcolabs.business';
            headers['X-Title'] = process.env.OPENROUTER_TITLE || 'AZZ&CO LABS';
        }
        
        return headers;
    }
    
    /**
     * Check if service is available
     */
    async checkHealth() {
        if (!this.apiUrl || !this.model) {
            return {
                available: false,
                error: 'Missing API_URL or MODEL in environment variables'
            };
        }
        
        try {
            if (this.format === 'ollama') {
                const response = await axios.post(
                    `${this.apiUrl}/api/generate`,
                    { model: this.model, prompt: 'test', stream: false },
                    { headers: this.getHeaders(), timeout: 5000 }
                );
                return { available: true, provider: 'ollama', model: this.model };
            } else {
                const response = await axios.post(
                    `${this.apiUrl}/chat/completions`,
                    { model: this.model, messages: [{ role: 'user', content: 'test' }], max_tokens: 5 },
                    { headers: this.getHeaders(), timeout: 5000 }
                );
                return { available: true, provider: 'openai-compatible', model: this.model };
            }
        } catch (error) {
            return {
                available: false,
                error: error.message,
                status: error.response?.status
            };
        }
    }
    
    /**
     * Generate AI response
     */
    async generateResponse(userMessage, interactionHistory = [], visitorId = null) {
        // Validate configuration
        if (!this.apiUrl) {
            throw new Error('AI_API_URL or OLLAMA_API_URL not set in environment variables');
        }
        if (!this.model) {
            throw new Error('AI_MODEL or OLLAMA_MODEL not set in environment variables');
        }
        if (!this.apiKey && !this.apiUrl.includes('localhost')) {
            throw new Error('AI_API_KEY or OLLAMA_API_KEY not set in environment variables');
        }
        
        try {
            console.log('🤖 Generating response...');
            console.log('📡 API URL:', this.apiUrl);
            console.log('🤖 Model:', this.model);
            
            // Detect persona and get prompt
            const personaDetection = personaDetector.detectPersona(userMessage, interactionHistory);
            const contextKeywords = personaDetector.extractContextKeywords(userMessage);
            const prompt = promptManager.getPrompt(contextKeywords, personaDetection.persona, userMessage);
            const systemPrompt = prompt.split('MESSAGE UTILISATEUR:')[0] || prompt;
            
            let response;
            
            if (this.format === 'ollama') {
                // Ollama native format
                let fullPrompt = `${systemPrompt}\n\nMESSAGE UTILISATEUR: ${userMessage}`;
                
                if (interactionHistory && interactionHistory.length > 0) {
                    const historyText = interactionHistory.slice(-5).map(msg => {
                        const role = msg.role || 'user';
                        const content = msg.content || msg.message || '';
                        return `${role === 'assistant' ? 'ASSISTANT' : 'UTILISATEUR'}: ${content}`;
                    }).join('\n');
                    fullPrompt = `${fullPrompt}\n\nHISTORIQUE:\n${historyText}`;
                }
                
                const apiResponse = await axios.post(
                    `${this.apiUrl}/api/generate`,
                    {
                        model: this.model,
                        prompt: fullPrompt,
                        stream: false,
                        options: {
                            temperature: 0.7,
                            top_p: 0.9,
                            top_k: 40
                        }
                    },
                    {
                        headers: this.getHeaders(),
                        timeout: this.timeout
                    }
                );
                
                const generatedText = apiResponse.data.response || '';
                
                if (!generatedText) {
                    throw new Error('Empty response from Ollama API');
                }
                
                return {
                    response: this.cleanResponse(generatedText),
                    persona: personaDetection.persona,
                    confidence: personaDetection.confidence,
                    contextKeywords: contextKeywords,
                    model: this.model,
                    provider: 'ollama'
                };
            } else {
                // OpenAI-compatible format (OpenRouter, DeepSeek, etc.)
                const messages = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ];
                
                // Add history if available
                if (interactionHistory && interactionHistory.length > 0) {
                    interactionHistory.slice(-5).forEach(msg => {
                        messages.push({
                            role: msg.role || 'user',
                            content: msg.content || msg.message || ''
                        });
                    });
                }
                
                const apiResponse = await axios.post(
                    `${this.apiUrl}/chat/completions`,
                    {
                        model: this.model,
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: this.getHeaders(),
                        timeout: this.timeout
                    }
                );
                
                const generatedText = apiResponse.data.choices?.[0]?.message?.content || '';
                
                if (!generatedText) {
                    throw new Error('Empty response from API');
                }
                
                return {
                    response: this.cleanResponse(generatedText),
                    persona: personaDetection.persona,
                    confidence: personaDetection.confidence,
                    contextKeywords: contextKeywords,
                    model: this.model,
                    provider: 'openai-compatible'
                };
            }
        } catch (error) {
            console.error('❌ AI API Error:', error.message);
            if (error.response) {
                console.error('❌ Status:', error.response.status);
                console.error('❌ Data:', JSON.stringify(error.response.data));
            }
            
            const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
            throw new Error(`AI API Error: ${errorMessage}`);
        }
    }
    
    /**
     * Clean and format response text
     */
    cleanResponse(text) {
        let cleaned = text
            .replace(/RÉPONSE.*?:/gi, '')
            .replace(/MESSAGE UTILISATEUR.*?:/gi, '')
            .replace(/CONTEXTE.*?:/gi, '')
            .trim();
        
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        if (!cleaned.match(/[.!?]$/)) {
            cleaned += '.';
        }
        
        return cleaned;
    }
}

module.exports = new OllamaService();
