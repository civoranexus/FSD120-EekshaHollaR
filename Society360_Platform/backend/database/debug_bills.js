const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function debugData() {
    try {
        const bills = await pool.query('SELECT * FROM bills');
        console.log('--- BILLS ---');
        console.log(JSON.stringify(bills.rows, null, 2));

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await pool.end();
    }
}

debugData();
