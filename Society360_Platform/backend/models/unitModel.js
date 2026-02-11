const db = require('../config/db');

const Unit = {
    create: async (unit) => {
        const { block_id, unit_number, floor_number, type, status, maintenance_amount, rent_amount } = unit;
        const query = `
            INSERT INTO units (block_id, unit_number, floor_number, type, status, maintenance_amount, rent_amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [block_id, unit_number, floor_number, type, status || 'vacant', maintenance_amount || 0, rent_amount || 0];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    findAll: async () => {
        const query = 'SELECT * FROM units';
        const result = await db.query(query);
        return result.rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM units WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    findByBlock: async (block_id) => {
        const query = 'SELECT * FROM units WHERE block_id = $1';
        const result = await db.query(query, [block_id]);
        return result.rows;
    },

    findUnitsByUser: async (user_id) => {
        const query = `
            SELECT u.*, uu.resident_type 
            FROM units u
            JOIN user_units uu ON u.id = uu.unit_id
            WHERE uu.user_id = $1 AND uu.status = 'active'
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    },

    // ==================== ADMIN METHODS ====================

    /**
     * Update unit details
     */
    update: async (id, unitData) => {
        const { unit_number, floor_number, type, status, maintenance_amount, rent_amount } = unitData;
        const query = `
            UPDATE units
            SET unit_number = COALESCE($1, unit_number),
                floor_number = COALESCE($2, floor_number),
                type = COALESCE($3, type),
                status = COALESCE($4, status),
                maintenance_amount = COALESCE($5, maintenance_amount),
                rent_amount = COALESCE($6, rent_amount)
            WHERE id = $7
            RETURNING *;
        `;
        const values = [unit_number, floor_number, type, status, maintenance_amount, rent_amount, id];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Delete unit
     */
    delete: async (id) => {
        const query = 'DELETE FROM units WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    /**
     * Get unit with residents
     */
    getWithResidents: async (id) => {
        const unitQuery = 'SELECT * FROM units WHERE id = $1';
        const unitResult = await db.query(unitQuery, [id]);

        if (unitResult.rows.length === 0) return null;

        const residentsQuery = `
            SELECT u.id, u.full_name, u.email, u.phone_number, uu.resident_type, uu.is_primary_contact, uu.move_in_date
            FROM users u
            JOIN user_units uu ON u.id = uu.user_id
            WHERE uu.unit_id = $1 AND uu.status = 'active'
        `;
        const residentsResult = await db.query(residentsQuery, [id]);

        return {
            ...unitResult.rows[0],
            residents: residentsResult.rows
        };
    },

    /**
     * Get all units with pagination and filters
     */
    getAllWithFilters: async (filters = {}) => {
        const { page = 1, limit = 10, block_id, status, type } = filters;
        const offset = (page - 1) * limit;

        let query = 'SELECT u.*, b.name as block_name FROM units u LEFT JOIN blocks b ON u.block_id = b.id WHERE 1=1';
        const values = [];
        let paramCount = 1;

        if (block_id) {
            query += ` AND u.block_id = $${paramCount}`;
            values.push(block_id);
            paramCount++;
        }
        if (status) {
            query += ` AND u.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }
        if (type) {
            query += ` AND u.type = $${paramCount}`;
            values.push(type);
            paramCount++;
        }

        // Clone values for count query before adding limit/offset
        const countValues = [...values];

        query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        // Get total count with same filters
        let countQuery = 'SELECT COUNT(*) FROM units u WHERE 1=1';
        let countParamCount = 1;

        if (block_id) {
            countQuery += ` AND u.block_id = $${countParamCount}`;
            countParamCount++;
        }
        if (status) {
            countQuery += ` AND u.status = $${countParamCount}`;
            countParamCount++;
        }
        if (type) {
            countQuery += ` AND u.type = $${countParamCount}`;
        }

        const countResult = await db.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].count);

        return {
            units: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    // ==================== BLOCK MANAGEMENT ====================

    /**
     * Get all blocks
     */
    getAllBlocks: async () => {
        const query = 'SELECT * FROM blocks ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    },

    /**
     * Create new block
     */
    createBlock: async (blockData) => {
        const { name, description } = blockData;
        const query = `
            INSERT INTO blocks (name, description)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await db.query(query, [name, description || null]);
        return result.rows[0];
    },

    /**
     * Update block
     */
    updateBlock: async (id, blockData) => {
        const { name, description } = blockData;
        const query = `
            UPDATE blocks
            SET name = COALESCE($1, name),
                description = COALESCE($2, description)
            WHERE id = $3
            RETURNING *;
        `;
        const result = await db.query(query, [name, description, id]);
        return result.rows[0];
    },

    /**
     * Delete block
     */
    deleteBlock: async (id) => {
        const query = 'DELETE FROM blocks WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    // ==================== RESIDENT ASSIGNMENT ====================

    /**
     * Assign resident to unit
     */
    assignResident: async (assignmentData) => {
        const { user_id, unit_id, resident_type, is_primary_contact, move_in_date } = assignmentData;

        // Start a transaction would be better, but for now we'll do sequential calls
        const query = `
            INSERT INTO user_units (user_id, unit_id, resident_type, is_primary_contact, move_in_date, status)
            VALUES ($1, $2, $3, $4, $5, 'active')
            RETURNING *;
        `;
        const values = [user_id, unit_id, resident_type, is_primary_contact || false, move_in_date || new Date()];
        const result = await db.query(query, values);

        // Also update the unit status to occupied
        await db.query('UPDATE units SET status = \'occupied\' WHERE id = $1', [unit_id]);

        return result.rows[0];
    },

    /**
     * Remove resident from unit
     */
    removeResident: async (unit_id, user_id) => {
        const query = `
            UPDATE user_units
            SET status = 'moved_out', move_out_date = CURRENT_TIMESTAMP
            WHERE unit_id = $1 AND user_id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [unit_id, user_id]);

        // Check if any active residents left
        const checkQuery = 'SELECT COUNT(*) FROM user_units WHERE unit_id = $1 AND status = \'active\'';
        const checkResult = await db.query(checkQuery, [unit_id]);
        if (parseInt(checkResult.rows[0].count) === 0) {
            await db.query('UPDATE units SET status = \'vacant\' WHERE id = $1', [unit_id]);
        }

        return result.rows[0];
    },

    /**
     * Deallocate all residents from a unit
     */
    deallocateUnit: async (unit_id) => {
        const query = `
            UPDATE user_units
            SET status = 'moved_out', move_out_date = CURRENT_TIMESTAMP
            WHERE unit_id = $1 AND status = 'active'
            RETURNING *;
        `;
        const result = await db.query(query, [unit_id]);

        // Update unit status to vacant
        await db.query('UPDATE units SET status = \'vacant\' WHERE id = $1', [unit_id]);

        return result.rows;
    }

};

module.exports = Unit;
