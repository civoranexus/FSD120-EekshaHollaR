const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Mock db module
jest.mock('../config/db');

describe('Visitor Management API', () => {
    let residentToken;
    let staffToken;
    const residentUser = { id: 'user-1', role: 'resident', email: 'res@test.com' };
    const staffUser = { id: 'staff-1', role: 'staff', email: 'staff@test.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'testsecret';
        residentToken = jwt.sign({ id: residentUser.id }, process.env.JWT_SECRET);
        staffToken = jwt.sign({ id: staffUser.id }, process.env.JWT_SECRET);
    });

    describe('POST /api/visitors/pre-approve', () => {
        it('should allow resident to pre-approve visitor for their unit', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [residentUser] });

            // Mock Unit.findUnitsByUser
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'unit-1', unit_number: '101', resident_type: 'owner' }]
            });

            // Mock Visitor.create
            db.query.mockResolvedValueOnce({
                rows: [{
                    id: 'vis-1',
                    visitor_name: 'Guest',
                    status: 'approved',
                    unit_id: 'unit-1'
                }]
            });

            const res = await request(app)
                .post('/api/visitors/pre-approve')
                .set('Authorization', `Bearer ${residentToken}`)
                .send({
                    visitor_name: 'Guest',
                    visitor_phone: '123',
                    purpose: 'Visit',
                    unit_id: 'unit-1'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('approved');
            expect(db.query).toHaveBeenCalledTimes(3);
        });

        it('should deny if resident is not linked to unit', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [residentUser] });

            // Mock Unit.findUnitsByUser (returns empty or different unit)
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'unit-2' }]
            });

            const res = await request(app)
                .post('/api/visitors/pre-approve')
                .set('Authorization', `Bearer ${residentToken}`)
                .send({
                    visitor_name: 'Guest',
                    unit_id: 'unit-1'
                });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('POST /api/visitors/check-in', () => {
        it('should allow staff to check in visitor', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [staffUser] });

            // Mock Visitor.updateStatus (assuming visitor_id provided)
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'vis-1', status: 'checked_in' }]
            });

            const res = await request(app)
                .post('/api/visitors/check-in')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ visitor_id: 'vis-1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('checked_in');
        });
    });

    describe('GET /api/visitors/history', () => {
        it('should return visitor history for resident units', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [residentUser] });

            // Mock Unit.findUnitsByUser
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'unit-1' }]
            });

            // Mock Visitor.findByUnit
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'vis-1', visitor_name: 'Guest' }]
            });

            const res = await request(app)
                .get('/api/visitors/history')
                .set('Authorization', `Bearer ${residentToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(1);
        });
    });
});
