require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../config/db');

const updateVisitorSchema = async () => {
    try {
        console.log('Updating visitor_logs table...');

        // Add expected_arrival column if not exists
        await db.query(`
            ALTER TABLE visitor_logs 
            ADD COLUMN IF NOT EXISTS expected_arrival TIMESTAMP WITH TIME ZONE;
        `);
        console.log('Added expected_arrival column.');

        // Add any other missing columns if needed
        // For example, visitor_type? The frontend uses it in line 129
        await db.query(`
            ALTER TABLE visitor_logs 
            ADD COLUMN IF NOT EXISTS visitor_type VARCHAR(50) DEFAULT 'guest';
        `);
        console.log('Added visitor_type column.');

        console.log('Visitor schema update completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating visitor schema:', error);
        process.exit(1);
    }
};

updateVisitorSchema();
