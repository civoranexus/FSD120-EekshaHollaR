const db = require('../config/db');

const AdminModel = {
    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with pagination and filters
     */
    getAllUsers: async (filters = {}) => {
        const { page = 1, limit = 10, role, status, search } = filters;
        const offset = (page - 1) * limit;

        let query = `
            SELECT u.id, u.full_name, 
                   split_part(u.full_name, ' ', 1) as first_name,
                   CASE 
                     WHEN position(' ' in u.full_name) > 0 THEN substring(u.full_name from position(' ' in u.full_name) + 1)
                     ELSE ''
                   END as last_name,
                   u.email, u.phone_number, u.status, u.profile_picture_url,
                   u.created_at, u.updated_at, r.name as role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.deleted_at IS NULL
        `;
        const values = [];
        let paramCount = 1;

        // Add filters
        if (role) {
            query += ` AND r.name = $${paramCount}`;
            values.push(role);
            paramCount++;
        }

        if (status) {
            query += ` AND u.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            values.push(`%${search}%`);
            paramCount++;
        }

        // Add pagination
        query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.deleted_at IS NULL
        `;
        const countValues = [];
        let countParamCount = 1;

        if (role) {
            countQuery += ` AND r.name = $${countParamCount}`;
            countValues.push(role);
            countParamCount++;
        }
        if (status) {
            countQuery += ` AND u.status = $${countParamCount}`;
            countValues.push(status);
            countParamCount++;
        }
        if (search) {
            countQuery += ` AND (u.full_name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
            countValues.push(`%${search}%`);
        }

        const countResult = await db.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].count);

        return {
            users: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    /**
     * Get user by ID with full details
     */
    getUserById: async (id) => {
        const query = `
            SELECT u.id, u.full_name, 
                   split_part(u.full_name, ' ', 1) as first_name,
                   CASE 
                     WHEN position(' ' in u.full_name) > 0 THEN substring(u.full_name from position(' ' in u.full_name) + 1)
                     ELSE ''
                   END as last_name,
                   u.email, u.phone_number, u.status, u.profile_picture_url, u.base_salary,
                   u.created_at, u.updated_at, r.name as role, r.id as role_id
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1 AND u.deleted_at IS NULL
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    updateSalary: async (id, salary) => {
        const query = `
            UPDATE users
            SET base_salary = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING id, full_name, email, base_salary, updated_at
        `;
        const result = await db.query(query, [salary, id]);
        return result.rows[0];
    },

    /**
     * Create new user
     */
    createUser: async (userData) => {
        const { full_name, email, password_hash, phone_number, role_id, status, profile_picture_url } = userData;

        const query = `
            INSERT INTO users (full_name, email, password_hash, phone_number, role_id, status, profile_picture_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, full_name, email, phone_number, status, created_at
        `;

        const values = [
            full_name,
            email,
            password_hash,
            phone_number || null,
            role_id,
            status || 'active',
            profile_picture_url || null
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Update user details
     */
    updateUser: async (id, userData) => {
        const { first_name, last_name, full_name, email, phone_number, status, profile_picture_url } = userData;

        // Handle name components
        let final_full_name = full_name;
        if (!final_full_name && (first_name || last_name)) {
            final_full_name = `${first_name || ''} ${last_name || ''}`.trim();
        }

        const query = `
            UPDATE users
            SET full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                phone_number = COALESCE($3, phone_number),
                status = COALESCE($4, status),
                profile_picture_url = COALESCE($5, profile_picture_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND deleted_at IS NULL
            RETURNING id, full_name, 
                      split_part(full_name, ' ', 1) as first_name,
                      substring(full_name from position(' ' in full_name) + 1) as last_name,
                      email, phone_number, status, updated_at
        `;

        const values = [final_full_name, email, phone_number, status, profile_picture_url, id];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Update user status (active, inactive, banned)
     */
    updateUserStatus: async (id, status) => {
        const query = `
            UPDATE users
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING id, full_name, email, status, updated_at
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    },

    /**
     * Update user role
     */
    updateUserRole: async (id, role_id) => {
        const query = `
            UPDATE users
            SET role_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING id, full_name, email, role_id, updated_at
        `;
        const result = await db.query(query, [role_id, id]);
        return result.rows[0];
    },

    /**
     * Soft delete user
     */
    deleteUser: async (id) => {
        const query = `
            UPDATE users
            SET deleted_at = CURRENT_TIMESTAMP, status = 'inactive'
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id, full_name, email
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    /**
     * Get user statistics
     */
    getUserStats: async () => {
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_users,
                COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as active_users,
                COUNT(*) FILTER (WHERE status = 'inactive' AND deleted_at IS NULL) as inactive_users,
                COUNT(*) FILTER (WHERE status = 'banned' AND deleted_at IS NULL) as banned_users,
                COUNT(*) FILTER (WHERE r.name = 'admin' AND deleted_at IS NULL) as admin_count,
                COUNT(*) FILTER (WHERE r.name = 'staff' AND deleted_at IS NULL) as staff_count,
                COUNT(*) FILTER (WHERE r.name = 'resident' AND deleted_at IS NULL) as resident_count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `;
        const result = await db.query(query);
        return result.rows[0];
    },

    /**
     * Get role by name
     */
    getRoleByName: async (roleName) => {
        const query = 'SELECT * FROM roles WHERE name = $1';
        const result = await db.query(query, [roleName]);
        return result.rows[0];
    },

    /**
     * Get all roles
     */
    getAllRoles: async () => {
        const query = 'SELECT * FROM roles ORDER BY id';
        const result = await db.query(query);
        return result.rows;
    }
};

module.exports = AdminModel;
