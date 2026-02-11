const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Mock db module
jest.mock('../config/db');

describe('Maintenance API', () => {
    let residentToken;
    let staffToken;
    let adminToken;
    const residentUser = { id: 'user-1', role: 'resident', email: 'res@test.com' };
    const staffUser = { id: 'staff-1', role: 'staff', email: 'staff@test.com' };
    const adminUser = { id: 'admin-1', role: 'admin', email: 'admin@test.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'testsecret';
        residentToken = jwt.sign({ id: residentUser.id }, process.env.JWT_SECRET);
        staffToken = jwt.sign({ id: staffUser.id }, process.env.JWT_SECRET);
        adminToken = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET);
    });

    describe('POST /api/maintenance', () => {
        it('should allow resident to create ticket for their unit', async () => {
            db.query.mockResolvedValueOnce({ rows: [residentUser] }); // Auth
            db.query.mockResolvedValueOnce({ rows: [{ id: 'unit-1' }] }); // Unit check
            db.query.mockResolvedValueOnce({ rows: [{ id: 'ticket-1', title: 'Leak' }] }); // Create

            const res = await request(app)
                .post('/api/maintenance')
                .set('Authorization', `Bearer ${residentToken}`)
                .send({
                    unit_id: 'unit-1',
                    category: 'Plumbing',
                    title: 'Leak',
                    description: 'Water leaking'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.title).toEqual('Leak');
        });
    });

    describe('PUT /api/maintenance/:id/assign', () => {
        it('should allow admin to assign ticket to staff', async () => {
            db.query.mockResolvedValueOnce({ rows: [adminUser] }); // Auth
            db.query.mockResolvedValueOnce({ rows: [staffUser] }); // Staff check
            db.query.mockResolvedValueOnce({ rows: [{ id: 'ticket-1', assigned_to_id: 'staff-1' }] }); // Assign

            const res = await request(app)
                .put('/api/maintenance/ticket-1/assign')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ staff_id: 'staff-1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.assigned_to_id).toEqual('staff-1');
        });
    });

    describe('PUT /api/maintenance/:id/status', () => {
        it('should allow staff to update status to resolved', async () => {
            db.query.mockResolvedValueOnce({ rows: [staffUser] }); // Auth
            db.query.mockResolvedValueOnce({ rows: [{ id: 'ticket-1', status: 'resolved', resolved_at: new Date() }] }); // Update

            const res = await request(app)
                .put('/api/maintenance/ticket-1/status')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ status: 'resolved' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('resolved');
            expect(res.body.resolved_at).toBeDefined();
        });
    });
});
