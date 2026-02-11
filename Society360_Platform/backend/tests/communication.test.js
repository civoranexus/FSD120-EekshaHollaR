const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

// Mock db module
jest.mock('../config/db');

describe('Communication API', () => {
    let adminToken, residentToken;
    const mockAdminUser = {
        id: 'admin-uuid-123',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@society360.com',
        role: 'Admin',
        role_id: 1
    };

    const mockResidentUser = {
        id: 'resident-uuid-456',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@society360.com',
        role: 'Resident',
        role_id: 3
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Generate mock tokens (simplified for testing)
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'temp_secret_key_123';
        adminToken = jwt.sign({ id: mockAdminUser.id, role: mockAdminUser.role }, secret);
        residentToken = jwt.sign({ id: mockResidentUser.id, role: mockResidentUser.role }, secret);
    });

    describe('Announcements', () => {
        describe('POST /api/communication/announcements', () => {
            it('should allow admin to create announcement', async () => {
                // Mock auth middleware user lookup
                db.query
                    .mockResolvedValueOnce({ rows: [mockAdminUser] }) // Auth middleware
                    .mockResolvedValueOnce({ // Create announcement
                        rows: [{
                            id: 'announcement-uuid-1',
                            title: 'Society Meeting',
                            content: 'Meeting on Sunday',
                            author_id: mockAdminUser.id,
                            created_at: new Date()
                        }]
                    })
                    .mockResolvedValueOnce({ rows: [{ id: mockResidentUser.id }] }) // Get residents
                    .mockResolvedValueOnce({ rows: [{}] }); // Create notification

                const res = await request(app)
                    .post('/api/communication/announcements')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        title: 'Society Meeting',
                        content: 'Meeting on Sunday'
                    });

                expect(res.statusCode).toEqual(201);
                expect(res.body).toHaveProperty('title', 'Society Meeting');
            });

            it('should deny resident from creating announcement', async () => {
                db.query.mockResolvedValueOnce({ rows: [mockResidentUser] }); // Auth middleware

                const res = await request(app)
                    .post('/api/communication/announcements')
                    .set('Authorization', `Bearer ${residentToken}`)
                    .send({
                        title: 'Test',
                        content: 'Test content'
                    });

                expect(res.statusCode).toEqual(403);
            });
        });

        describe('GET /api/communication/announcements', () => {
            it('should get all announcements', async () => {
                db.query
                    .mockResolvedValueOnce({ rows: [mockResidentUser] }) // Auth middleware
                    .mockResolvedValueOnce({ // Get announcements
                        rows: [{
                            id: 'announcement-1',
                            title: 'Test Announcement',
                            content: 'Test content',
                            first_name: 'Admin',
                            last_name: 'User'
                        }]
                    });

                const res = await request(app)
                    .get('/api/communication/announcements')
                    .set('Authorization', `Bearer ${residentToken}`);

                expect(res.statusCode).toEqual(200);
                expect(Array.isArray(res.body)).toBe(true);
            });
        });
    });

    describe('Messages', () => {
        describe('POST /api/communication/messages', () => {
            it('should allow resident to post message', async () => {
                db.query
                    .mockResolvedValueOnce({ rows: [mockResidentUser] }) // Auth middleware
                    .mockResolvedValueOnce({ // Create message
                        rows: [{
                            id: 'message-uuid-1',
                            content: 'Hello everyone!',
                            user_id: mockResidentUser.id,
                            created_at: new Date()
                        }]
                    });

                const res = await request(app)
                    .post('/api/communication/messages')
                    .set('Authorization', `Bearer ${residentToken}`)
                    .send({
                        content: 'Hello everyone!'
                    });

                expect(res.statusCode).toEqual(201);
                expect(res.body).toHaveProperty('content', 'Hello everyone!');
            });

            it('should create notification when replying to message', async () => {
                const parentMessageId = 'parent-message-uuid';
                db.query
                    .mockResolvedValueOnce({ rows: [mockResidentUser] }) // Auth middleware
                    .mockResolvedValueOnce({ // Create message
                        rows: [{
                            id: 'reply-uuid-1',
                            content: 'Reply content',
                            user_id: mockResidentUser.id,
                            parent_id: parentMessageId
                        }]
                    })
                    .mockResolvedValueOnce({ rows: [{ user_id: 'other-user-id' }] }) // Get parent author
                    .mockResolvedValueOnce({ rows: [{}] }); // Create notification

                const res = await request(app)
                    .post('/api/communication/messages')
                    .set('Authorization', `Bearer ${residentToken}`)
                    .send({
                        content: 'Reply content',
                        parent_id: parentMessageId
                    });

                expect(res.statusCode).toEqual(201);
            });
        });

        describe('DELETE /api/communication/messages/:id', () => {
            it('should allow admin to delete any message', async () => {
                const messageId = 'message-to-delete';
                db.query
                    .mockResolvedValueOnce({ rows: [mockAdminUser] }) // Auth middleware
                    .mockResolvedValueOnce({ rows: [{ user_id: mockResidentUser.id }] }) // Check message owner
                    .mockResolvedValueOnce({ rows: [{}] }); // Delete message

                const res = await request(app)
                    .delete(`/api/communication/messages/${messageId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.statusCode).toEqual(200);
            });

            it('should allow user to delete own message', async () => {
                const messageId = 'my-message';
                db.query
                    .mockResolvedValueOnce({ rows: [mockResidentUser] }) // Auth middleware
                    .mockResolvedValueOnce({ rows: [{ user_id: mockResidentUser.id }] }) // Check message owner
                    .mockResolvedValueOnce({ rows: [{}] }); // Delete message

                const res = await request(app)
                    .delete(`/api/communication/messages/${messageId}`)
                    .set('Authorization', `Bearer ${residentToken}`);

                expect(res.statusCode).toEqual(200);
            });
        });
    });

    describe('Notifications', () => {
        describe('GET /api/communication/notifications', () => {
            it('should get user notifications', async () => {
                db.query
                    .mockResolvedValueOnce({ rows: [mockResidentUser] }) // Auth middleware
                    .mockResolvedValueOnce({ // Get notifications
                        rows: [{
                            id: 'notif-1',
                            user_id: mockResidentUser.id,
                            type: 'announcement',
                            message: 'New announcement posted',
                            is_read: false
                        }]
                    });

                const res = await request(app)
                    .get('/api/communication/notifications')
                    .set('Authorization', `Bearer ${residentToken}`);

                expect(res.statusCode).toEqual(200);
                expect(Array.isArray(res.body)).toBe(true);
            });
        });

        describe('PUT /api/communication/notifications/:id/read', () => {
            it('should mark notification as read', async () => {
                const notifId = 'notif-123';
                db.query
                    .mockResolvedValueOnce({ rows: [mockResidentUser] }) // Auth middleware
                    .mockResolvedValueOnce({ // Mark as read
                        rows: [{
                            id: notifId,
                            is_read: true
                        }]
                    });

                const res = await request(app)
                    .put(`/api/communication/notifications/${notifId}/read`)
                    .set('Authorization', `Bearer ${residentToken}`);

                expect(res.statusCode).toEqual(200);
                expect(res.body).toHaveProperty('is_read', true);
            });
        });
    });
});
