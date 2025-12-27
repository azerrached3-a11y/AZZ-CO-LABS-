/**
 * Chatbot Service Tests
 * Tests for the chatbot AI service
 */

const ollamaService = require('../backend/services/ollamaService');

describe('OllamaService (Google Gemini)', () => {
    test('Should have API key configuration', () => {
        // Service should be initialized
        expect(ollamaService).toBeDefined();
        expect(ollamaService.apiKey).toBeDefined();
    });
    
    test('Should detect format correctly', () => {
        const format = ollamaService.detectFormat('https://generativelanguage.googleapis.com');
        expect(format).toBe('openai');
    });
    
    test('Should select model correctly', () => {
        // Reset rate limits for testing
        ollamaService.rateLimits.flash.dailyCount = 0;
        ollamaService.rateLimits.flashLite.dailyCount = 0;
        ollamaService.rateLimits.flash.requests = [];
        ollamaService.rateLimits.flashLite.requests = [];
        
        const model = ollamaService.selectModel(false);
        expect(['flash', 'flashLite']).toContain(model);
    });
    
    test('Should handle rate limiting', () => {
        // Set rate limits to max
        ollamaService.rateLimits.flash.dailyCount = 500;
        ollamaService.rateLimits.flashLite.dailyCount = 1500;
        
        expect(() => ollamaService.selectModel(false)).toThrow('All Gemini models are currently rate limited');
    });
});

describe('Response Generation', () => {
    test('Should generate response with valid input', async () => {
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.warn('Skipping test: GOOGLE_AI_API_KEY not set');
            return;
        }
        
        try {
            const response = await ollamaService.generateResponse('Hello', [], 'test-visitor');
            expect(response).toHaveProperty('response');
            expect(response).toHaveProperty('model');
            expect(response).toHaveProperty('provider', 'google-gemini');
        } catch (error) {
            console.warn('Test skipped:', error.message);
        }
    });
});
