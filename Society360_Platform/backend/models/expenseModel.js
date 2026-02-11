const db = require('../config/db');

class Expense {
    // Create a new expense
    static async create(data) {
        const query = `
            INSERT INTO expenses (
                expense_type, category, amount, description, staff_id, 
                maintenance_ticket_id, payment_status, payment_date, payment_method,
                transaction_reference, period_month, period_year, recorded_by_id, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        const values = [
            data.expense_type,
            data.category,
            data.amount,
            data.description || null,
            data.staff_id || null,
            data.maintenance_ticket_id || null,
            data.payment_status || 'pending',
            data.payment_date || null,
            data.payment_method || null,
            data.transaction_reference || null,
            data.period_month || null,
            data.period_year || null,
            data.recorded_by_id,
            data.notes || null
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Get all expenses with filters
    static async getAll(filters = {}) {
        let query = `
            SELECT 
                e.*,
                s.full_name as staff_name,
                s.email as staff_email,
                r.full_name as recorded_by_name,
                mt.title as maintenance_title,
                mt.category as maintenance_category
            FROM expenses e
            LEFT JOIN users s ON e.staff_id = s.id
            LEFT JOIN users r ON e.recorded_by_id = r.id
            LEFT JOIN maintenance_tickets mt ON e.maintenance_ticket_id = mt.id
            WHERE 1=1
        `;
        const values = [];
        let paramCount = 1;

        if (filters.expense_type) {
            query += ` AND e.expense_type = $${paramCount}`;
            values.push(filters.expense_type);
            paramCount++;
        }

        if (filters.staff_id) {
            query += ` AND e.staff_id = $${paramCount}`;
            values.push(filters.staff_id);
            paramCount++;
        }

        if (filters.payment_status) {
            query += ` AND e.payment_status = $${paramCount}`;
            values.push(filters.payment_status);
            paramCount++;
        }

        if (filters.period_month && filters.period_year) {
            query += ` AND e.period_month = $${paramCount} AND e.period_year = $${paramCount + 1}`;
            values.push(filters.period_month, filters.period_year);
            paramCount += 2;
        }

        query += ` ORDER BY e.created_at DESC`;

        const result = await db.query(query, values);
        return result.rows;
    }

    // Get expense by ID
    static async getById(id) {
        const query = `
            SELECT 
                e.*,
                s.full_name as staff_name,
                s.email as staff_email,
                r.full_name as recorded_by_name,
                mt.title as maintenance_title,
                mt.category as maintenance_category,
                mt.unit_id
            FROM expenses e
            LEFT JOIN users s ON e.staff_id = s.id
            LEFT JOIN users r ON e.recorded_by_id = r.id
            LEFT JOIN maintenance_tickets mt ON e.maintenance_ticket_id = mt.id
            WHERE e.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Get expenses for a specific staff member
    static async getByStaff(staff_id) {
        const query = `
            SELECT 
                e.*,
                r.full_name as recorded_by_name,
                mt.title as maintenance_title,
                mt.category as maintenance_category
            FROM expenses e
            LEFT JOIN users r ON e.recorded_by_id = r.id
            LEFT JOIN maintenance_tickets mt ON e.maintenance_ticket_id = mt.id
            WHERE e.staff_id = $1
            ORDER BY e.created_at DESC
        `;
        const result = await db.query(query, [staff_id]);
        return result.rows;
    }

    // Update payment status
    static async updatePaymentStatus(id, status, paymentDetails = {}) {
        const query = `
            UPDATE expenses
            SET 
                payment_status = $1,
                payment_date = $2,
                payment_method = $3,
                transaction_reference = $4
            WHERE id = $5
            RETURNING *;
        `;
        const values = [
            status,
            paymentDetails.payment_date || new Date(),
            paymentDetails.payment_method || null,
            paymentDetails.transaction_reference || null,
            id
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Get expense statistics
    static async getStats(filters = {}) {
        let query = `
            SELECT 
                expense_type,
                SUM(amount) as total_amount,
                COUNT(*) as count,
                SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount
            FROM expenses
            WHERE 1=1
        `;
        const values = [];
        let paramCount = 1;

        if (filters.period_month && filters.period_year) {
            query += ` AND period_month = $${paramCount} AND period_year = $${paramCount + 1}`;
            values.push(filters.period_month, filters.period_year);
            paramCount += 2;
        }

        query += ` GROUP BY expense_type`;

        const result = await db.query(query, values);
        return result.rows;
    }

    // Get staff performance metrics (for increments)
    static async getStaffPerformance(staff_id, period_year = null, period_month = null) {
        let query = `
            SELECT 
                COUNT(DISTINCT e.maintenance_ticket_id) as maintenance_tasks_completed,
                SUM(CASE WHEN e.expense_type = 'maintenance' THEN e.amount ELSE 0 END) as total_maintenance_value,
                SUM(CASE WHEN e.expense_type = 'salary' THEN e.amount ELSE 0 END) as total_salary_paid,
                COUNT(CASE WHEN e.expense_type = 'salary' THEN 1 END) as salary_payments
            FROM expenses e
            WHERE e.staff_id = $1
        `;
        const values = [staff_id];
        let paramCount = 2;

        if (period_year && period_month) {
            query += ` AND e.period_year = $${paramCount} AND e.period_month = $${paramCount + 1}`;
            values.push(period_year, period_month);
        }

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Delete expense
    static async delete(id) {
        const query = 'DELETE FROM expenses WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Generate monthly salaries for all staff
    static async generateMonthlySalaries(month, year, adminId) {
        // 1. Get all staff (role_id = 2) with a base_salary
        const staffQuery = `
            SELECT id, full_name, base_salary 
            FROM users 
            WHERE role_id = 2 AND base_salary IS NOT NULL AND status = 'active'
        `;
        const staffResult = await db.query(staffQuery);
        const staffList = staffResult.rows;

        const results = {
            generated: 0,
            skipped: 0,
            errors: 0,
            details: []
        };

        for (const staff of staffList) {
            try {
                // 2. Check if salary already exists for this staff in this period
                const checkQuery = `
                    SELECT id FROM expenses 
                    WHERE staff_id = $1 AND expense_type = 'salary' 
                    AND period_month = $2 AND period_year = $3
                `;
                const checkResult = await db.query(checkQuery, [staff.id, month, year]);

                if (checkResult.rows.length === 0) {
                    // 3. Create salary expense
                    await this.create({
                        expense_type: 'salary',
                        category: 'Monthly Salary',
                        amount: staff.base_salary,
                        description: `Auto-generated salary for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
                        staff_id: staff.id,
                        payment_status: 'pending',
                        period_month: month,
                        period_year: year,
                        recorded_by_id: adminId
                    });
                    results.generated++;
                    results.details.push({ name: staff.full_name, status: 'generated', amount: staff.base_salary });
                } else {
                    results.skipped++;
                    results.details.push({ name: staff.full_name, status: 'skipped (already exists)' });
                }
            } catch (err) {
                console.error(`Error generating salary for ${staff.full_name}:`, err);
                results.errors++;
                results.details.push({ name: staff.full_name, status: 'error', error: err.message });
            }
        }

        return results;
    }
}

module.exports = Expense;
