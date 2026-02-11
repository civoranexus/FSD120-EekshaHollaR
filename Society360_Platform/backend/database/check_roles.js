const db = require('../config/db');

const checkRoles = async () => {
    try {
        const res = await db.query('SELECT * FROM roles');
        console.log('Roles:', JSON.stringify(res.rows));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRoles();
