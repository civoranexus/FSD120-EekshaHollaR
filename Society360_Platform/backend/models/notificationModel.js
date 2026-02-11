const db = require('../config/db');

const Notification = {
    create: async ({ user_id, type, message, reference_id }) => {
        const query = `
            INSERT INTO notifications (user_id, type, message, reference_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [user_id, type, message, reference_id]);
        return result.rows[0];
    },

    getByUser: async (userId) => {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC;
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    markAsRead: async (id) => {
        const query = 'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
};

module.exports = Notification;
