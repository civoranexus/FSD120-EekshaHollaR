const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const { hashPassword } = require('../utils/security');

// Mock db module
jest.mock('../config/db');

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            // Mock db.query for user existence check (returns empty) and creation (returns new user)
            db.query
                .mockResolvedValueOnce({ rows: [] }) // Check user exists
                .mockResolvedValueOnce({ // Insert user
                    rows: [{
                        id: 1,
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com',
                        role: 'Resident',
                        created_at: new Date()
                    }]
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'Resident',
                    phone_number: '1234567890'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.model.email).toEqual('john@example.com');
        });

        it('should not register duplicate user', async () => {
            // Mock db.query to return existing user
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'john@example.com' }]
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    phone_number: '1234567890'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login valid user', async () => {
            const hashedPassword = await hashPassword('password123');

            db.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    password_hash: hashedPassword,
                    role: 'Resident'
                }]
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should reject invalid credentials', async () => {
            db.query.mockResolvedValueOnce({
                rows: [] // No user found
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});
