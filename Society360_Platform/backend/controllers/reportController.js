const ReportModel = require('../models/reportModel');

const ReportController = {
    /**
     * Get user statistics and trends
     * GET /api/admin/reports/users?start_date=2024-01-01&end_date=2024-12-31
     */
    getUserReport: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const report = await ReportModel.getUserReport({ start_date, end_date });

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error generating user report:', error);
            res.status(500).json({ success: false, message: 'Failed to generate user report', error: error.message });
        }
    },

    /**
     * Get unit occupancy and distribution report
     * GET /api/admin/reports/units
     */
    getUnitReport: async (req, res) => {
        try {
            const report = await ReportModel.getUnitReport();

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error generating unit report:', error);
            res.status(500).json({ success: false, message: 'Failed to generate unit report', error: error.message });
        }
    },

    /**
     * Get financial summary report
     * GET /api/admin/reports/finance?start_date=2024-01-01&end_date=2024-12-31
     */
    getFinanceReport: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const report = await ReportModel.getFinanceReport({ start_date, end_date });

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error generating finance report:', error);
            res.status(500).json({ success: false, message: 'Failed to generate finance report', error: error.message });
        }
    },

    /**
     * Get maintenance tickets report
     * GET /api/admin/reports/maintenance?start_date=2024-01-01&end_date=2024-12-31
     */
    getMaintenanceReport: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const report = await ReportModel.getMaintenanceReport({ start_date, end_date });

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error generating maintenance report:', error);
            res.status(500).json({ success: false, message: 'Failed to generate maintenance report', error: error.message });
        }
    },

    /**
     * Get visitor logs report
     * GET /api/admin/reports/visitors?start_date=2024-01-01&end_date=2024-12-31
     */
    getVisitorReport: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const report = await ReportModel.getVisitorReport({ start_date, end_date });

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error generating visitor report:', error);
            res.status(500).json({ success: false, message: 'Failed to generate visitor report', error: error.message });
        }
    },

    /**
     * Get combined dashboard statistics
     * GET /api/admin/reports/dashboard
     */
    getDashboardStats: async (req, res) => {
        try {
            const stats = await ReportModel.getDashboardStats();

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error generating dashboard stats:', error);
            res.status(500).json({ success: false, message: 'Failed to generate dashboard statistics', error: error.message });
        }
    }
};

module.exports = ReportController;
