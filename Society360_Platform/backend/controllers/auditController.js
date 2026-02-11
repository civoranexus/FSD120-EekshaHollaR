const AuditModel = require('../models/auditModel');

const AuditController = {
    /**
     * Get all audit logs with filters
     * GET /api/admin/audit-logs?page=1&limit=50&user_id=xxx&action=USER_CREATED&resource_type=users&start_date=2024-01-01&end_date=2024-12-31
     */
    getAllLogs: async (req, res) => {
        try {
            const { page, limit, user_id, action, resource_type, start_date, end_date } = req.query;

            const result = await AuditModel.getAll({
                page,
                limit,
                user_id,
                action,
                resource_type,
                start_date,
                end_date
            });

            res.status(200).json({
                success: true,
                data: result.logs,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
        }
    },

    /**
     * Get audit log by ID
     * GET /api/admin/audit-logs/:id
     */
    getLogById: async (req, res) => {
        try {
            const { id } = req.params;
            const log = await AuditModel.getById(id);

            if (!log) {
                return res.status(404).json({ success: false, message: 'Audit log not found' });
            }

            res.status(200).json({ success: true, data: log });
        } catch (error) {
            console.error('Error fetching audit log:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch audit log', error: error.message });
        }
    },

    /**
     * Get audit logs for specific user
     * GET /api/admin/audit-logs/user/:userId?limit=50
     */
    getLogsByUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const { limit } = req.query;

            const logs = await AuditModel.getByUser(userId, limit);

            res.status(200).json({ success: true, data: logs });
        } catch (error) {
            console.error('Error fetching user audit logs:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user audit logs', error: error.message });
        }
    },

    /**
     * Get audit logs for specific resource
     * GET /api/admin/audit-logs/resource/:resourceType/:resourceId?limit=50
     */
    getLogsByResource: async (req, res) => {
        try {
            const { resourceType, resourceId } = req.params;
            const { limit } = req.query;

            const logs = await AuditModel.getByResource(resourceType, resourceId, limit);

            res.status(200).json({ success: true, data: logs });
        } catch (error) {
            console.error('Error fetching resource audit logs:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch resource audit logs', error: error.message });
        }
    },

    /**
     * Get audit statistics
     * GET /api/admin/audit-logs/stats?start_date=2024-01-01&end_date=2024-12-31
     */
    getStats: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const stats = await AuditModel.getStats({ start_date, end_date });

            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            console.error('Error fetching audit statistics:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch audit statistics', error: error.message });
        }
    },

    /**
     * Search audit logs
     * GET /api/admin/audit-logs/search?q=searchterm&limit=50
     */
    searchLogs: async (req, res) => {
        try {
            const { q, limit } = req.query;

            if (!q) {
                return res.status(400).json({ success: false, message: 'Search query is required' });
            }

            const logs = await AuditModel.search(q, limit);

            res.status(200).json({ success: true, data: logs });
        } catch (error) {
            console.error('Error searching audit logs:', error);
            res.status(500).json({ success: false, message: 'Failed to search audit logs', error: error.message });
        }
    },

    /**
     * Get recent audit logs
     * GET /api/admin/audit-logs/recent?limit=100
     */
    getRecentLogs: async (req, res) => {
        try {
            const { limit } = req.query;
            const logs = await AuditModel.getRecent(limit);

            res.status(200).json({ success: true, data: logs });
        } catch (error) {
            console.error('Error fetching recent audit logs:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch recent audit logs', error: error.message });
        }
    }
};

module.exports = AuditController;
