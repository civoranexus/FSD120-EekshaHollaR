const db = require('../config/db');

const checkDb = async () => {
    try {
        console.log('Checking database connection...');
        const res = await db.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        console.log('Checking extensions...');
        const ext = await db.query('SELECT * FROM pg_extension');
        console.log('Extensions:', ext.rows.map(r => r.extname).join(', '));

        console.log('Checking tables...');
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        process.exit(0);
    } catch (error) {
        console.error('Database check failed:', error);
        process.exit(1);
    }
};

checkDb();
