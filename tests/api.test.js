/**
 * API Tests
 * Tests for API routes and endpoints
 */

const request = require('supertest');
const app = require('../api/index.js');

describe('API Health Check', () => {
    test('GET /health should return 200', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
        
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});

describe('Chatbot API', () => {
    test('POST /api/chatbot/message should require message', async () => {
        const response = await request(app)
            .post('/api/chatbot/message')
            .send({})
            .expect(200); // Returns 200 with error message
        
        expect(response.body).toHaveProperty('response');
    });
    
    test('POST /api/chatbot/message should accept valid message', async () => {
        const response = await request(app)
            .post('/api/chatbot/message')
            .send({
                message: 'Hello',
                visitorId: 'test-visitor',
                sessionId: 'test-session'
            })
            .expect(200);
        
        expect(response.body).toHaveProperty('response');
    });
});

describe('Analytics API', () => {
    test('POST /api/analytics/pageview should return success', async () => {
        const response = await request(app)
            .post('/api/analytics/pageview')
            .send({
                visitorId: 'test-visitor',
                pagePath: '/',
                pageTitle: 'Test Page'
            })
            .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
    });
});

describe('Rate Limiting', () => {
    test('Should enforce rate limits', async () => {
        // Make multiple requests quickly
        const requests = Array(110).fill(null).map(() => 
            request(app).post('/api/analytics/pageview').send({
                visitorId: 'test',
                pagePath: '/',
                pageTitle: 'Test'
            })
        );
        
        const responses = await Promise.all(requests);
        const rateLimited = responses.some(r => 
            r.body.error && r.body.error.includes('Trop de requêtes')
        );
        
        // Should have at least one rate limited response
        expect(rateLimited).toBe(true);
    });
});
