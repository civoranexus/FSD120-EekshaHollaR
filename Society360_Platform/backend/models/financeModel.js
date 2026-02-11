const db = require('../config/db');

class Finance {
    // Bills
    static async createBill(data) {
        const query = `
            INSERT INTO bills (unit_id, bill_type, amount, bill_date, due_date, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'unpaid')
            RETURNING *;
        `;
        const values = [
            data.unit_id,
            data.bill_type,
            data.amount,
            data.bill_date,
            data.due_date,
            data.description
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getBillsByUnit(unitId) {
        const query = `SELECT * FROM bills WHERE unit_id = $1 ORDER BY created_at DESC`;
        const result = await db.query(query, [unitId]);
        return result.rows;
    }

    static async getAllBills() {
        const query = `SELECT * FROM bills ORDER BY created_at DESC`;
        const result = await db.query(query);
        return result.rows;
    }

    static async getBillById(id) {
        const query = `SELECT * FROM bills WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }


    static async updateBillStatus(id, status) {
        const query = `
            UPDATE bills
            SET status = $1
            WHERE id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    }

    // Payments
    static async createPayment(data) {
        const query = `
            INSERT INTO payments (bill_id, payer_id, amount_paid, payment_method, transaction_reference, status)
            VALUES ($1, $2, $3, $4, $5, 'success')
            RETURNING *;
        `;
        const values = [
            data.bill_id,
            data.payer_id,
            data.amount_paid,
            data.payment_method,
            data.transaction_reference
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getPaymentByBillId(billId) {
        const query = `SELECT * FROM payments WHERE bill_id = $1`;
        const result = await db.query(query, [billId]);
        return result.rows[0];
    }

    static async getPaymentById(id) {
        const query = `SELECT * FROM payments WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Reports
    static async getFinancialStats() {
        const totalRevenueQuery = `SELECT SUM(amount_paid) as total_revenue FROM payments WHERE status = 'success'`;
        const pendingDuesQuery = `SELECT SUM(amount) as pending_dues FROM bills WHERE status IN ('unpaid', 'overdue', 'partially_paid')`;

        const [revenueResult, duesResult] = await Promise.all([
            db.query(totalRevenueQuery),
            db.query(pendingDuesQuery)
        ]);

        return {
            total_revenue: revenueResult.rows[0].total_revenue || 0,
            pending_dues: duesResult.rows[0].pending_dues || 0
        };
    }
}

module.exports = Finance;
