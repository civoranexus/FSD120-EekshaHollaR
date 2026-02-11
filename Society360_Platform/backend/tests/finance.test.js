const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Mock db module
jest.mock('../config/db');

describe('Finance Module API', () => {
    let adminToken;
    let residentToken;
    const adminUser = { id: 'admin-1', role: 'admin', email: 'admin@test.com' };
    const residentUser = { id: 'resident-1', role: 'resident', email: 'res@test.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'testsecret';
        adminToken = jwt.sign({ id: adminUser.id, role: 'admin' }, process.env.JWT_SECRET);
        residentToken = jwt.sign({ id: residentUser.id, role: 'resident' }, process.env.JWT_SECRET);
    });

    describe('POST /api/finance/generate', () => {
        it('should allow admin to generate a bill', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [adminUser] });

            // Mock Finance.createBill
            db.query.mockResolvedValueOnce({
                rows: [{
                    id: 'bill-1',
                    unit_id: 'unit-1',
                    amount: 1000,
                    status: 'unpaid'
                }]
            });

            const res = await request(app)
                .post('/api/finance/generate')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    unit_id: 'unit-1',
                    bill_type: 'Maintenance',
                    amount: 1000,
                    description: 'Jan 2026'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.bill.id).toEqual('bill-1');
        });
    });

    describe('GET /api/finance', () => {
        it('should allow resident to get their bills', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [residentUser] });

            // Mock Finance.getBillsByUnit
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'bill-1', amount: 1000 }]
            });

            const res = await request(app)
                .get('/api/finance?unit_id=unit-1')
                .set('Authorization', `Bearer ${residentToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(1);
        });
    });

    describe('POST /api/finance/pay', () => {
        it('should allow resident to pay a bill', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [residentUser] });

            // Mock Finance.getBillById
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'bill-1', amount: 1000, status: 'unpaid' }]
            });

            // Mock Finance.createPayment
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'pay-1', amount_paid: 1000, status: 'success' }]
            });

            // Mock Finance.updateBillStatus
            db.query.mockResolvedValueOnce({
                rows: [{ id: 'bill-1', status: 'paid' }]
            });

            const res = await request(app)
                .post('/api/finance/pay')
                .set('Authorization', `Bearer ${residentToken}`)
                .send({
                    bill_id: 'bill-1',
                    payment_method: 'UPI',
                    amount: 1000
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Payment successful');
        });
    });

    describe('GET /api/finance/reports', () => {
        it('should return financial stats for admin', async () => {
            // Mock authMiddleware user fetch
            db.query.mockResolvedValueOnce({ rows: [adminUser] });

            // Mock Finance.getFinancialStats (Promise.all calls)
            // Note: db.query is called twice in parallel here
            db.query
                .mockResolvedValueOnce({ rows: [{ total_revenue: 5000 }] }) // First query result
                .mockResolvedValueOnce({ rows: [{ pending_dues: 2000 }] }); // Second query result

            const res = await request(app)
                .get('/api/finance/reports')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({
                total_revenue: 5000,
                pending_dues: 2000
            });
        });
    });
});
