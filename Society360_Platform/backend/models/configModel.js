const db = require('../config/db');

const ConfigModel = {
    /**
     * Get all configurations
     */
    getAll: async () => {
        const query = 'SELECT * FROM system_config ORDER BY category, config_key';
        const result = await db.query(query);
        return result.rows;
    },

    /**
     * Get configurations by category
     */
    getByCategory: async (category) => {
        const query = 'SELECT * FROM system_config WHERE category = $1 ORDER BY config_key';
        const result = await db.query(query, [category]);
        return result.rows;
    },

    /**
     * Get single configuration by key
     */
    getByKey: async (key) => {
        const query = 'SELECT * FROM system_config WHERE config_key = $1';
        const result = await db.query(query, [key]);
        return result.rows[0];
    },

    /**
     * Create new configuration
     */
    create: async (configData, userId) => {
        const { config_key, config_value, category, description, data_type } = configData;

        const query = `
            INSERT INTO system_config (config_key, config_value, category, description, data_type, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [
            config_key,
            config_value,
            category,
            description || null,
            data_type || 'string',
            userId
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Update configuration value
     */
    update: async (key, value, userId) => {
        const query = `
            UPDATE system_config
            SET config_value = $1,
                updated_by = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE config_key = $3
            RETURNING *;
        `;
        const result = await db.query(query, [value, userId, key]);
        return result.rows[0];
    },

    /**
     * Update full configuration
     */
    updateFull: async (key, configData, userId) => {
        const { config_value, category, description, data_type } = configData;

        const query = `
            UPDATE system_config
            SET config_value = COALESCE($1, config_value),
                category = COALESCE($2, category),
                description = COALESCE($3, description),
                data_type = COALESCE($4, data_type),
                updated_by = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE config_key = $6
            RETURNING *;
        `;

        const values = [config_value, category, description, data_type, userId, key];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    /**
     * Delete configuration
     */
    delete: async (key) => {
        const query = 'DELETE FROM system_config WHERE config_key = $1 RETURNING *';
        const result = await db.query(query, [key]);
        return result.rows[0];
    },

    /**
     * Seed default configurations
     */
    seedDefaults: async () => {
        const defaults = [
            // Billing configurations
            { config_key: 'billing.maintenance_fee', config_value: '5000', category: 'billing', description: 'Monthly maintenance fee per unit', data_type: 'number' },
            { config_key: 'billing.late_payment_penalty', config_value: '100', category: 'billing', description: 'Late payment penalty amount', data_type: 'number' },
            { config_key: 'billing.due_date_day', config_value: '5', category: 'billing', description: 'Day of month for bill due date', data_type: 'number' },

            // Security configurations
            { config_key: 'security.visitor_approval_required', config_value: 'true', category: 'security', description: 'Require resident approval for visitors', data_type: 'boolean' },
            { config_key: 'security.max_login_attempts', config_value: '5', category: 'security', description: 'Maximum login attempts before lockout', data_type: 'number' },
            { config_key: 'security.session_timeout', config_value: '3600', category: 'security', description: 'Session timeout in seconds', data_type: 'number' },

            // Notification configurations
            { config_key: 'notifications.email_enabled', config_value: 'true', category: 'notifications', description: 'Enable email notifications', data_type: 'boolean' },
            { config_key: 'notifications.sms_enabled', config_value: 'false', category: 'notifications', description: 'Enable SMS notifications', data_type: 'boolean' },
            { config_key: 'notifications.announcement_email', config_value: 'true', category: 'notifications', description: 'Send email for announcements', data_type: 'boolean' },

            // General configurations
            { config_key: 'general.society_name', config_value: 'Society360', category: 'general', description: 'Name of the society', data_type: 'string' },
            { config_key: 'general.contact_email', config_value: 'admin@society360.com', category: 'general', description: 'Society contact email', data_type: 'string' },
            { config_key: 'general.contact_phone', config_value: '+91-1234567890', category: 'general', description: 'Society contact phone', data_type: 'string' },

            // Maintenance configurations
            { config_key: 'maintenance.auto_assign', config_value: 'false', category: 'maintenance', description: 'Auto-assign tickets to staff', data_type: 'boolean' },
            { config_key: 'maintenance.sla_hours', config_value: '48', category: 'maintenance', description: 'SLA response time in hours', data_type: 'number' }
        ];

        const insertedConfigs = [];
        for (const config of defaults) {
            try {
                const query = `
                    INSERT INTO system_config (config_key, config_value, category, description, data_type)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (config_key) DO NOTHING
                    RETURNING *;
                `;
                const values = [config.config_key, config.config_value, config.category, config.description, config.data_type];
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    insertedConfigs.push(result.rows[0]);
                }
            } catch (error) {
                console.error(`Error seeding config ${config.config_key}:`, error);
            }
        }

        return insertedConfigs;
    }
};

module.exports = ConfigModel;
