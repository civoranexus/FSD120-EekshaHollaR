const db = require('../config/db');

const migrate = async () => {
    try {
        console.log('Starting migration...');

        // Add maintenance_amount column if it doesn't exist
        await db.query(`
            ALTER TABLE units 
            ADD COLUMN IF NOT EXISTS maintenance_amount DECIMAL(10, 2) DEFAULT 0.00;
        `);
        console.log('Added maintenance_amount column');

        // Add rent_amount column if it doesn't exist
        await db.query(`
            ALTER TABLE units 
            ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10, 2) DEFAULT 0.00;
        `);
        console.log('Added rent_amount column');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
