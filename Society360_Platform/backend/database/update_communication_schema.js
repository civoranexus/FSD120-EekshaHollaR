const db = require('../config/db');

const updateSchema = async () => {
    try {
        console.log('Starting schema update...');

        // Messages Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                content TEXT NOT NULL,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
                is_flagged BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created messages table.');

        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_id);`);

        // Notifications Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                reference_id UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created notifications table.');

        await db.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`);

        console.log('Schema update completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
};

updateSchema();
