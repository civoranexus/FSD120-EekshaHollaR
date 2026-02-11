const db = require('../config/db');

const MaintenanceTicket = {
    create: async (ticket) => {
        const { unit_id, requester_id, category, title, description, priority } = ticket;
        const query = `
            INSERT INTO maintenance_tickets (unit_id, requester_id, category, title, description, priority)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [unit_id, requester_id, category, title, description, priority || 'medium'];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    findById: async (id) => {
        const query = 'SELECT * FROM maintenance_tickets WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    findAll: async () => {
        const query = `
            SELECT 
                mt.*,
                u.unit_number,
                u.floor_number,
                b.name as block_name,
                req.full_name as requester_name,
                staff.full_name as assigned_staff_name,
                staff.id as assigned_to_id
            FROM maintenance_tickets mt
            LEFT JOIN units u ON mt.unit_id = u.id
            LEFT JOIN blocks b ON u.block_id = b.id
            LEFT JOIN users req ON mt.requester_id = req.id
            LEFT JOIN users staff ON mt.assigned_to_id = staff.id
            ORDER BY mt.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows.map(row => ({
            ...row,
            unit: {
                unit_number: row.unit_number,
                block: row.block_name
            }
        }));
    },

    findByUnit: async (unit_id) => {
        const query = `
            SELECT 
                mt.*,
                u.unit_number,
                u.floor_number,
                b.name as block_name,
                req.full_name as requester_name,
                staff.full_name as assigned_staff_name
            FROM maintenance_tickets mt
            LEFT JOIN units u ON mt.unit_id = u.id
            LEFT JOIN blocks b ON u.block_id = b.id
            LEFT JOIN users req ON mt.requester_id = req.id
            LEFT JOIN users staff ON mt.assigned_to_id = staff.id
            WHERE mt.unit_id = $1 
            ORDER BY mt.created_at DESC
        `;
        const result = await db.query(query, [unit_id]);
        return result.rows;
    },

    findByAssignedStaff: async (staff_id) => {
        const query = `
            SELECT 
                mt.*,
                u.unit_number,
                u.floor_number,
                b.name as block_name,
                req.full_name as requester_name,
                staff.full_name as assigned_staff_name
            FROM maintenance_tickets mt
            LEFT JOIN units u ON mt.unit_id = u.id
            LEFT JOIN blocks b ON u.block_id = b.id
            LEFT JOIN users req ON mt.requester_id = req.id
            LEFT JOIN users staff ON mt.assigned_to_id = staff.id
            WHERE mt.assigned_to_id = $1 
            ORDER BY mt.created_at DESC
        `;
        const result = await db.query(query, [staff_id]);
        return result.rows.map(row => ({
            ...row,
            unit: {
                unit_number: row.unit_number,
                block: row.block_name
            }
        }));
    },

    assign: async (id, staff_id) => {
        const query = `
            UPDATE maintenance_tickets 
            SET assigned_to_id = $1, status = 'in_progress' 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await db.query(query, [staff_id, id]);
        return result.rows[0];
    },

    updateStatus: async (id, status, actualCost = null) => {
        let query = 'UPDATE maintenance_tickets SET status = $1, updated_at = NOW()';
        const values = [status];

        if (status === 'resolved') {
            query += ', resolved_at = NOW()';
            if (actualCost !== null) {
                query += ', actual_cost = $3';
                values.push(actualCost);
            }
        }

        query += ` WHERE id = $2 RETURNING *`;
        values.splice(1, 0, id); // Insert id at index 1

        const result = await db.query(query, values);
        return result.rows[0];
    },

    getPendingPayments: async () => {
        const query = `
            SELECT 
                mt.*,
                u.unit_number,
                b.name as block_name,
                staff.full_name as staff_name,
                staff.id as staff_id
            FROM maintenance_tickets mt
            JOIN units u ON mt.unit_id = u.id
            JOIN blocks b ON u.block_id = b.id
            JOIN users staff ON mt.assigned_to_id = staff.id
            LEFT JOIN expenses e ON e.maintenance_ticket_id = mt.id
            WHERE mt.status = 'resolved' AND e.id IS NULL
            ORDER BY mt.resolved_at ASC
        `;
        const result = await db.query(query);
        return result.rows;
    },

    getStaffList: async () => {
        const query = `
            SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.base_salary,
                u.phone_number,
                u.status,
                COUNT(mt.id) FILTER (WHERE mt.status = 'closed') as tasks_completed,
                SUM(e.amount) FILTER (WHERE e.expense_type = 'maintenance') as total_bonuses
            FROM users u
            LEFT JOIN maintenance_tickets mt ON u.id = mt.assigned_to_id
            LEFT JOIN expenses e ON u.id = e.staff_id
            WHERE u.role_id = 2
            GROUP BY u.id
            ORDER BY u.full_name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }
};

module.exports = MaintenanceTicket;
