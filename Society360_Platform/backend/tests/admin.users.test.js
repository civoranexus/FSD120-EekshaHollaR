const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Admin User Management API', () => {
    let adminToken;
    let testUserId;
    let testRoleId;

    beforeAll(async () => {
        // Ensure admin role exists and get role id
        const roleResult = await db.query("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
        testRoleId = roleResult.rows[0]?.id;

        // Try to register a test admin user. If it already exists, fall back to login.
        const adminUser = {
            first_name: 'Test',
            last_name: 'Admin',
            email: 'test-admin@society360.com',
            password: 'admin123',
            role: 'admin'
        };

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(adminUser);

        if (registerRes.statusCode === 201) {
            // Registered successfully
            adminToken = registerRes.body.token;
        } else {
            // Probably already exists — login to get token
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: adminUser.email, password: adminUser.password });

            adminToken = loginRes.body.token;
        }

        // Fallback: ensure we have a token
        if (!adminToken) {
            throw new Error('Failed to obtain admin token in test setup');
        }
    });

    describe('GET /api/admin/users', () => {
        it('should get all users with pagination', async () => {
            const res = await request(app)
                .get('/api/admin/users?page=1&limit=10')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination).toHaveProperty('total');
            expect(res.body.pagination).toHaveProperty('page');
            expect(res.body.pagination).toHaveProperty('limit');
        });

        it('should filter users by role', async () => {
            const res = await request(app)
                .get('/api/admin/users?role=admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(user => {
                expect(user.role).toBe('admin');
            });
        });

        it('should filter users by status', async () => {
            const res = await request(app)
                .get('/api/admin/users?status=active')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(user => {
                expect(user.status).toBe('active');
            });
        });

        it('should search users by name or email', async () => {
            const res = await request(app)
                .get('/api/admin/users?search=admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/admin/users');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/admin/users', () => {
        it('should create a new user', async () => {
            const newUser = {
                full_name: 'Test User',
                email: `testuser${Date.now()}@test.com`,
                password: 'Test123!',
                phone_number: '+91-9876543210',
                role: 'resident',
                status: 'active'
            };

            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.full_name).toBe(newUser.full_name);
            expect(res.body.data.email).toBe(newUser.email);

            testUserId = res.body.data.id;
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    full_name: 'Test User'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            const duplicateUser = {
                full_name: 'Duplicate User',
                email: 'admin@society360.com', // Existing email
                password: 'Test123!',
                role: 'resident'
            };

            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(duplicateUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('already exists');
        });
    });

    describe('GET /api/admin/users/:id', () => {
        it('should get user by ID', async () => {
            const res = await request(app)
                .get(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testUserId);
        });

        it('should return 404 for non-existent user', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/admin/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        it('should update user details', async () => {
            const updates = {
                full_name: 'Updated Test User',
                phone_number: '+91-1234567890'
            };

            const res = await request(app)
                .put(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updates);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.full_name).toBe(updates.full_name);
        });
    });

    describe('PATCH /api/admin/users/:id/status', () => {
        it('should update user status', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${testUserId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'inactive' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('inactive');
        });

        it('should fail with invalid status', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${testUserId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalid_status' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PATCH /api/admin/users/:id/role', () => {
        it('should update user role', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${testUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'staff' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should fail with invalid role', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${testUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'invalid_role' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/admin/users/stats', () => {
        it('should get user statistics', async () => {
            const res = await request(app)
                .get('/api/admin/users/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('total_users');
            expect(res.body.data).toHaveProperty('active_users');
            expect(res.body.data).toHaveProperty('admin_count');
            expect(res.body.data).toHaveProperty('staff_count');
            expect(res.body.data).toHaveProperty('resident_count');
        });
    });

    describe('GET /api/admin/roles', () => {
        it('should get all roles', async () => {
            const res = await request(app)
                .get('/api/admin/roles')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('should soft delete user', async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should not allow self-deletion', async () => {
            // Get current admin user ID
            const userRes = await request(app)
                .get('/api/admin/users?role=admin&limit=1')
                .set('Authorization', `Bearer ${adminToken}`);

            const adminId = userRes.body.data[0].id;

            const res = await request(app)
                .delete(`/api/admin/users/${adminId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Cannot delete your own account');
        });
    });
});
