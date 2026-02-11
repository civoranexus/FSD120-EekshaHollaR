const { hashPassword, comparePassword, generateToken } = require('../../utils/security');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Security Utils', () => {
    describe('hashPassword', () => {
        it('should return a hashed password', async () => {
            const password = 'mySecretPassword';
            const hashed = await hashPassword(password);
            expect(hashed).not.toBe(password);
            // It should be a bcrypt hash (starts with $2a$ or similar)
            expect(hashed).toMatch(/^\$2[ayb]\$.{56}$/);
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching passwords', async () => {
            const password = 'password123';
            const hashed = await hashPassword(password);
            const isMatch = await comparePassword(password, hashed);
            expect(isMatch).toBe(true);
        });

        it('should return false for incorrect passwords', async () => {
            const password = 'password123';
            const hashed = await hashPassword(password);
            const isMatch = await comparePassword('wrongPassword', hashed);
            expect(isMatch).toBe(false);
        });
    });

    describe('generateToken', () => {
        it('should return a valid JWT token', () => {
            const userId = '123';
            const role = 'admin';
            const token = generateToken(userId, role);

            expect(typeof token).toBe('string');

            // Verify payload
            const decoded = jwt.decode(token);
            expect(decoded).toMatchObject({ id: userId, role });
        });
    });
});
