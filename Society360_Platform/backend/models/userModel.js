const db = require('../config/db');

const User = {
    // Create a new user. Accepts either full_name OR first_name+last_name, and either role (name) or role_id.
    create: async (user) => {
        const { full_name, first_name, last_name, email, password, role, role_id, phone_number, profile_picture_url } = user;

        // Build full_name if first/last provided
        let name = full_name;
        if (!name && first_name) {
            name = `${first_name}${last_name ? ' ' + last_name : ''}`.trim();
        }

        // Resolve role_id
        let resolvedRoleId = role_id;

        // 1. If role_id missing but role name provided, look it up
        if (!resolvedRoleId && role) {
            const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [role.toLowerCase()]);
            if (roleRes.rows.length > 0) {
                resolvedRoleId = roleRes.rows[0].id;
            }
        }

        // 2. If still no role_id, default to 'resident'
        if (!resolvedRoleId) {
            const defaultRoleRes = await db.query('SELECT id FROM roles WHERE name = $1', ['resident']);
            if (defaultRoleRes.rows.length > 0) {
                resolvedRoleId = defaultRoleRes.rows[0].id;
            }
        }

        const query = `
      INSERT INTO users (full_name, email, password_hash, phone_number, role_id, profile_picture_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, phone_number, role_id, created_at;
    `;
        const values = [name || null, email, password, phone_number || null, resolvedRoleId, profile_picture_url || null];
        const result = await db.query(query, values);

        // Fetch role name to return (prefer explicit role param if provided)
        const userRow = result.rows[0];
        if (role && typeof role === 'string') {
            userRow.role = role;
        } else if (userRow && userRow.role_id) {
            const r = await db.query('SELECT name FROM roles WHERE id = $1', [userRow.role_id]);
            userRow.role = r.rows[0] ? r.rows[0].name : null;
        } else {
            userRow.role = null;
        }

        return userRow;
    },

    findByEmail: async (email) => {
        const query = `
            SELECT u.*, r.name as role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `;
        const result = await db.query(query, [email]);
        return result.rows[0];
    },

    findById: async (id) => {
        const query = `
            SELECT u.id, u.full_name, u.email, u.phone_number, u.profile_picture_url, u.password_hash, u.role_id, r.name as role, u.created_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `;
        const result = await db.query(query, [id]);
        // Debug: help tests trace mocked return shapes
        if (process.env.NODE_ENV === 'test') {
            console.log('userModel.findById called with id:', id, 'result:', result);
        }
        return result.rows[0];
    }
};

module.exports = User;
