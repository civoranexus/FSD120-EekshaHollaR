const request = require('supertest');
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const { generateToken } = require('../utils/security');
const db = require('../config/db');

// Mock db
jest.mock('../config/db');

const app = express();
app.use(express.json());

// Setup temporary routes for testing middleware isolation
app.get('/api/admin', protect, authorize('Admin'), (req, res) => {
    res.status(200).json({ message: 'Admin access granted' });
});

app.get('/api/resident', protect, authorize('Resident', 'Admin'), (req, res) => {
    res.status(200).json({ message: 'Resident access granted' });
});

describe('RBAC Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow Admin to access admin route', async () => {
        // 1. Mock DB call in 'protect' middleware to return an Admin user
        db.query.mockResolvedValueOnce({
            rows: [{ id: 1, role: 'Admin', email: 'admin@example.com' }]
        });

        // 2. Generate a valid token
        const token = generateToken(1, 'Admin');

        const res = await request(app)
            .get('/api/admin')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Admin access granted');
    });

    it('should deny Resident from accessing admin route', async () => {
        // 1. Mock DB call in 'protect' middleware to return a Resident user
        db.query.mockResolvedValueOnce({
            rows: [{ id: 2, role: 'Resident', email: 'user@example.com' }]
        });

        const token = generateToken(2, 'Resident');

        const res = await request(app)
            .get('/api/admin')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin to access resident route', async () => {
        // 1. Mock DB call in 'protect' middleware to return an Admin user
        db.query.mockResolvedValueOnce({
            rows: [{ id: 1, role: 'Admin', email: 'admin@example.com' }]
        });

        const token = generateToken(1, 'Admin');

        const res = await request(app)
            .get('/api/resident')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });
});
