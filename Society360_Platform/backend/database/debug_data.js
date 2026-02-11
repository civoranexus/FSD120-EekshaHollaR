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
        const users = await pool.query('SELECT u.id, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id');
        const assignments = await pool.query('SELECT * FROM user_units');
        const units = await pool.query('SELECT id, unit_number FROM units');

        console.log('--- USERS ---');
        console.log(JSON.stringify(users.rows, null, 2));
        console.log('--- ASSIGNMENTS ---');
        console.log(JSON.stringify(assignments.rows, null, 2));
        console.log('--- UNITS ---');
        console.log(JSON.stringify(units.rows, null, 2));

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await pool.end();
    }
}

debugData();
