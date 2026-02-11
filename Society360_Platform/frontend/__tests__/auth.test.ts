import { authApi } from '../lib/api/auth';

// Helper to make base64url
const base64url = (obj: object) => {
    return Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

const makeToken = (payload: object) => {
    const header = { alg: 'none', typ: 'JWT' };
    return `${base64url(header)}.${base64url(payload)}.`;
};

describe('authApi.isAuthenticated', () => {
    afterEach(() => {
        localStorage.removeItem('token');
    });

    test('returns true for a valid (non-expired) token', () => {
        const payload = { exp: Math.floor(Date.now() / 1000) + 60 };
        const token = makeToken(payload);
        localStorage.setItem('token', token);
        expect(authApi.isAuthenticated()).toBe(true);
    });

    test('returns false for an expired token', () => {
        const payload = { exp: Math.floor(Date.now() / 1000) - 10 };
        const token = makeToken(payload);
        localStorage.setItem('token', token);
        expect(authApi.isAuthenticated()).toBe(false);
    });
});