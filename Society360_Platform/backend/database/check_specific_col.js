const db = require('../config/db');

const checkColumns = async () => {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name LIKE 'role%';
        `);
        console.log('Columns found:', JSON.stringify(res.rows));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkColumns();
