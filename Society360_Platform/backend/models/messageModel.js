const db = require('../config/db');

const Message = {
    create: async ({ content, user_id, parent_id }) => {
        const query = `
            INSERT INTO messages (content, user_id, parent_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [content, user_id, parent_id || null]);
        return result.rows[0];
    },

    getAll: async () => {
        // Fetch messages with user info.
        // We might want to construct a tree in the controller, but for now getting flat list with parent_id is fine.
        const query = `
            SELECT m.*, u.first_name, u.last_name, u.profile_picture_url
            FROM messages m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    },

    delete: async (id) => {
        const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    flag: async (id) => {
        const query = 'UPDATE messages SET is_flagged = TRUE WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
};

module.exports = Message;
