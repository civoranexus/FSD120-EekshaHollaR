const request = require('supertest');

// Mock DB to prevent connection
jest.mock('../../config/db', () => ({
    query: jest.fn(),
    pool: { on: jest.fn(), end: jest.fn() }
}));

const app = require('../../app');

describe('Health Check API', () => {
    it('GET / should return 200 and welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Society360 API is running');
    });
});
