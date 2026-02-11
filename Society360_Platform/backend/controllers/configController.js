const ConfigModel = require('../models/configModel');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

const ConfigController = {
    /**
     * Get all configurations
     * GET /api/admin/config
     */
    getAllConfigs: async (req, res) => {
        try {
            const configs = await ConfigModel.getAll();
            res.status(200).json({ success: true, data: configs });
        } catch (error) {
            console.error('Error fetching configurations:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch configurations', error: error.message });
        }
    },

    /**
     * Get configurations by category
     * GET /api/admin/config/:category
     */
    getConfigsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const configs = await ConfigModel.getByCategory(category);
            res.status(200).json({ success: true, data: configs });
        } catch (error) {
            console.error('Error fetching configurations by category:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch configurations', error: error.message });
        }
    },

    /**
     * Get single configuration by key
     * GET /api/admin/config/key/:key
     */
    getConfigByKey: async (req, res) => {
        try {
            const { key } = req.params;
            const config = await ConfigModel.getByKey(key);

            if (!config) {
                return res.status(404).json({ success: false, message: 'Configuration not found' });
            }

            res.status(200).json({ success: true, data: config });
        } catch (error) {
            console.error('Error fetching configuration:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch configuration', error: error.message });
        }
    },

    /**
     * Create new configuration
     * POST /api/admin/config
     */
    createConfig: async (req, res) => {
        try {
            const { config_key, config_value, category, description, data_type } = req.body;

            if (!config_key || !config_value || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: config_key, config_value, category'
                });
            }

            const newConfig = await ConfigModel.create({
                config_key,
                config_value,
                category,
                description,
                data_type
            }, req.user.id);

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.CONFIG_CREATED, 'system_config', newConfig.id, {
                config: newConfig
            }, req);

            res.status(201).json({
                success: true,
                message: 'Configuration created successfully',
                data: newConfig
            });
        } catch (error) {
            console.error('Error creating configuration:', error);
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'Configuration key already exists' });
            }
            res.status(500).json({ success: false, message: 'Failed to create configuration', error: error.message });
        }
    },

    /**
     * Update configuration value
     * PUT /api/admin/config/:key
     */
    updateConfig: async (req, res) => {
        try {
            const { key } = req.params;
            const { config_value, category, description, data_type } = req.body;

            // Get old config for audit
            const oldConfig = await ConfigModel.getByKey(key);
            if (!oldConfig) {
                return res.status(404).json({ success: false, message: 'Configuration not found' });
            }

            let updatedConfig;
            if (config_value && !category && !description && !data_type) {
                // Simple value update
                updatedConfig = await ConfigModel.update(key, config_value, req.user.id);
            } else {
                // Full update
                updatedConfig = await ConfigModel.updateFull(key, {
                    config_value,
                    category,
                    description,
                    data_type
                }, req.user.id);
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.CONFIG_UPDATED, 'system_config', updatedConfig.id, {
                old: oldConfig,
                new: updatedConfig
            }, req);

            res.status(200).json({
                success: true,
                message: 'Configuration updated successfully',
                data: updatedConfig
            });
        } catch (error) {
            console.error('Error updating configuration:', error);
            res.status(500).json({ success: false, message: 'Failed to update configuration', error: error.message });
        }
    },

    /**
     * Delete configuration
     * DELETE /api/admin/config/:key
     */
    deleteConfig: async (req, res) => {
        try {
            const { key } = req.params;
            const deletedConfig = await ConfigModel.delete(key);

            if (!deletedConfig) {
                return res.status(404).json({ success: false, message: 'Configuration not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.CONFIG_DELETED, 'system_config', deletedConfig.id, {
                config: deletedConfig
            }, req);

            res.status(200).json({
                success: true,
                message: 'Configuration deleted successfully',
                data: deletedConfig
            });
        } catch (error) {
            console.error('Error deleting configuration:', error);
            res.status(500).json({ success: false, message: 'Failed to delete configuration', error: error.message });
        }
    },

    /**
     * Seed default configurations
     * POST /api/admin/config/seed
     */
    seedDefaults: async (req, res) => {
        try {
            const seededConfigs = await ConfigModel.seedDefaults();

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.CONFIG_CREATED, 'system_config', null, {
                seeded_count: seededConfigs.length
            }, req);

            res.status(200).json({
                success: true,
                message: `Seeded ${seededConfigs.length} default configurations`,
                data: seededConfigs
            });
        } catch (error) {
            console.error('Error seeding configurations:', error);
            res.status(500).json({ success: false, message: 'Failed to seed configurations', error: error.message });
        }
    }
};

module.exports = ConfigController;
