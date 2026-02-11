const db = require('../config/db');

const AuditModel = {
    /**
     * Get all audit logs with pagination and filters
     */
    getAll: async (filters = {}) => {
        const { page = 1, limit = 50, user_id, action, resource_type, start_date, end_date } = filters;
        const offset = (page - 1) * limit;

        let query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const values = [];
        let paramCount = 1;

        // Add filters
        if (user_id) {
            query += ` AND a.user_id = $${paramCount}`;
            values.push(user_id);
            paramCount++;
        }

        if (action) {
            query += ` AND a.action = $${paramCount}`;
            values.push(action);
            paramCount++;
        }

        if (resource_type) {
            query += ` AND a.resource_type = $${paramCount}`;
            values.push(resource_type);
            paramCount++;
        }

        if (start_date) {
            query += ` AND a.created_at >= $${paramCount}`;
            values.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND a.created_at <= $${paramCount}`;
            values.push(end_date);
            paramCount++;
        }

        // Add pagination
        query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM audit_logs a WHERE 1=1';
        const countValues = [];
        let countParamCount = 1;

        if (user_id) {
            countQuery += ` AND a.user_id = $${countParamCount}`;
            countValues.push(user_id);
            countParamCount++;
        }
        if (action) {
            countQuery += ` AND a.action = $${countParamCount}`;
            countValues.push(action);
            countParamCount++;
        }
        if (resource_type) {
            countQuery += ` AND a.resource_type = $${countParamCount}`;
            countValues.push(resource_type);
            countParamCount++;
        }
        if (start_date) {
            countQuery += ` AND a.created_at >= $${countParamCount}`;
            countValues.push(start_date);
            countParamCount++;
        }
        if (end_date) {
            countQuery += ` AND a.created_at <= $${countParamCount}`;
            countValues.push(end_date);
        }

        const countResult = await db.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].count);

        return {
            logs: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    /**
     * Get audit log by ID
     */
    getById: async (id) => {
        const query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    /**
     * Get audit logs for specific user
     */
    getByUser: async (user_id, limit = 50) => {
        const query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
            LIMIT $2
        `;
        const result = await db.query(query, [user_id, limit]);
        return result.rows;
    },

    /**
     * Get audit logs for specific resource
     */
    getByResource: async (resource_type, resource_id, limit = 50) => {
        const query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.resource_type = $1 AND a.resource_id = $2
            ORDER BY a.created_at DESC
            LIMIT $3
        `;
        const result = await db.query(query, [resource_type, resource_id, limit]);
        return result.rows;
    },

    /**
     * Get audit statistics
     */
    getStats: async (filters = {}) => {
        const { start_date, end_date } = filters;

        let query = `
            SELECT 
                COUNT(*) as total_logs,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT action) as unique_actions,
                COUNT(DISTINCT resource_type) as unique_resources
            FROM audit_logs
            WHERE 1=1
        `;
        const values = [];
        let paramCount = 1;

        if (start_date) {
            query += ` AND created_at >= $${paramCount}`;
            values.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND created_at <= $${paramCount}`;
            values.push(end_date);
        }

        const result = await db.query(query, values);

        // Get top actions
        const actionsQuery = `
            SELECT action, COUNT(*) as count
            FROM audit_logs
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        `;
        const actionsResult = await db.query(actionsQuery);

        // Get top users
        const usersQuery = `
            SELECT u.full_name, u.email, COUNT(a.id) as action_count
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            GROUP BY u.id, u.full_name, u.email
            ORDER BY action_count DESC
            LIMIT 10
        `;
        const usersResult = await db.query(usersQuery);

        return {
            summary: result.rows[0],
            top_actions: actionsResult.rows,
            top_users: usersResult.rows
        };
    },

    /**
     * Search audit logs
     */
    search: async (searchTerm, limit = 50) => {
        const query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE 
                a.action ILIKE $1 OR
                a.resource_type ILIKE $1 OR
                u.full_name ILIKE $1 OR
                u.email ILIKE $1
            ORDER BY a.created_at DESC
            LIMIT $2
        `;
        const result = await db.query(query, [`%${searchTerm}%`, limit]);
        return result.rows;
    },

    /**
     * Get recent audit logs
     */
    getRecent: async (limit = 100) => {
        const query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }
};

module.exports = AuditModel;
