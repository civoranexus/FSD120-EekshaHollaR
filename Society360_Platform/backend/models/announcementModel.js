const db = require('../config/db');

const Announcement = {
    create: async (announcement) => {
        const { title, content, author_id, target_audience, is_important, expires_at } = announcement;
        const query = `
      INSERT INTO announcements (title, content, author_id, target_audience, is_important, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
        const values = [title, content, author_id, target_audience || 'all', is_important || false, expires_at || null];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    getAll: async () => {
        const query = `
      SELECT a.*, u.full_name 
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC;
    `;
        const result = await db.query(query);
        return result.rows;
    },

    delete: async (id) => {
        const query = 'DELETE FROM announcements WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
};

module.exports = Announcement;
