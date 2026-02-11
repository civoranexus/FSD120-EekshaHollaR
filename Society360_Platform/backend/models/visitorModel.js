const db = require('../config/db');

const Visitor = {
    create: async (visitor) => {
        const { unit_id, visitor_name, visitor_phone, purpose, approved_by_user_id, status, expected_arrival, visitor_type, vehicle_number } = visitor;

        const query = `
            INSERT INTO visitor_logs (unit_id, visitor_name, visitor_phone, purpose, approved_by_user_id, status, expected_arrival, visitor_type, vehicle_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [unit_id, visitor_name, visitor_phone, purpose, approved_by_user_id, status || 'checked_in', expected_arrival || null, visitor_type || 'guest', vehicle_number || null];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    findAll: async () => {
        const query = 'SELECT * FROM visitor_logs';
        const result = await db.query(query);
        return result.rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM visitor_logs WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    findByUnit: async (unit_id) => {
        const query = 'SELECT * FROM visitor_logs WHERE unit_id = $1 ORDER BY check_in_time DESC';
        const result = await db.query(query, [unit_id]);
        return result.rows;
    },

    updateStatus: async (id, status, check_out_time = null) => {
        let query = 'UPDATE visitor_logs SET status = $1';
        const values = [status, id];
        let paramIndex = 3;

        if (check_out_time) {
            query += `, check_out_time = $${Math.abs(paramIndex - 1)}`; // wait, simplistic logic
            // Let's be explicit
            query = 'UPDATE visitor_logs SET status = $1, check_out_time = $2 WHERE id = $3 RETURNING *';
            const result = await db.query(query, [status, check_out_time, id]);
            return result.rows[0];
        } else {
            query += ' WHERE id = $2 RETURNING *';
            const result = await db.query(query, values);
            return result.rows[0];
        }
    }
};

module.exports = Visitor;
