const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
try {
    require('dotenv').config();
} catch (err) {
    // Continue if env vars are already set
}


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function resetDatabase() {
    const client = await pool.connect();

    try {
        console.log('🗑️  Dropping all tables...');

        // Drop all tables in reverse order of dependencies
        await client.query(`
            DROP TABLE IF EXISTS audit_logs CASCADE;
            DROP TABLE IF EXISTS system_config CASCADE;
            DROP TABLE IF EXISTS announcements CASCADE;
            DROP TABLE IF EXISTS payments CASCADE;
            DROP TABLE IF EXISTS bills CASCADE;
            DROP TABLE IF EXISTS maintenance_tickets CASCADE;
            DROP TABLE IF EXISTS visitor_logs CASCADE;
            DROP TABLE IF EXISTS user_units CASCADE;
            DROP TABLE IF EXISTS units CASCADE;
            DROP TABLE IF EXISTS blocks CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS roles CASCADE;
            DROP TYPE IF EXISTS user_role CASCADE;
        `);

        console.log('✅ All tables dropped successfully');

        // Read and execute schema.sql
        console.log('📋 Creating schema...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schema);
        console.log('✅ Schema created successfully');

        // Read and execute seed.sql
        console.log('🌱 Seeding database...');
        const seedPath = path.join(__dirname, 'seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');
        await client.query(seed);
        console.log('✅ Database seeded successfully');

        console.log('\n🎉 Database reset complete!');
        console.log('\n📝 Demo Credentials:');
        console.log('   Admin:    admin@society360.com / admin123');
        console.log('   Staff:    staff@society360.com / staff123');
        console.log('   Resident: resident@society360.com / resident123');

    } catch (error) {
        console.error('❌ Error resetting database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the reset
resetDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
