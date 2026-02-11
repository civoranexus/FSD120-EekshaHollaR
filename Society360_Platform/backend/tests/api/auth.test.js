const request = require('supertest');

// Mocks
jest.mock('../../config/db', () => ({
    query: jest.fn(),
    pool: { on: jest.fn(), end: jest.fn() }
}));

const app = require('../../app');
const User = require('../../models/userModel');
const { comparePassword, generateToken } = require('../../utils/security');

// Mock dependencies
jest.mock('../../models/userModel');
jest.mock('../../utils/security', () => ({
    comparePassword: jest.fn(),
    generateToken: jest.fn(),
    logAudit: jest.fn(), // Mock audit logger too if imported there, wait, it is imported in controller
    hashPassword: jest.fn(),
    AUDIT_ACTIONS: { USER_LOGIN: 'USER_LOGIN' }
}));

// Mock audit logger correctly because it's a named export in another file
jest.mock('../../utils/auditLogger', () => ({
    logAudit: jest.fn(),
    AUDIT_ACTIONS: { USER_LOGIN: 'USER_LOGIN', USER_CREATED: 'USER_CREATED' }
}));

describe('Auth API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                role: 'Resident',
                first_name: 'Test',
                last_name: 'User'
            };

            // Mock User.findByEmail to return user
            User.findByEmail.mockResolvedValue(mockUser);
            // Mock comparePassword to return true
            comparePassword.mockResolvedValue(true);
            // Mock generateToken
            generateToken.mockReturnValue('fake-jwt-token');

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token', 'fake-jwt-token');
            expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toContain('include a valid email');
        });

        it('should return 401 for incorrect password', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password_hash: 'hashedpassword'
            };

            User.findByEmail.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(false); // Password mismatch

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });
});
