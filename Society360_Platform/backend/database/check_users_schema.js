const db = require('../config/db');

const checkUsersSchema = async () => {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users table columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsersSchema();
