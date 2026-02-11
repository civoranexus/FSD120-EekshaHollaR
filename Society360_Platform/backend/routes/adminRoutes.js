const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

// Controllers
const AdminController = require('../controllers/adminController');
const UnitController = require('../controllers/unitController');
const ReportController = require('../controllers/reportController');
const ConfigController = require('../controllers/configController');
const AuditController = require('../controllers/auditController');
const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// ==================== USER MANAGEMENT ROUTES ====================
// Get user statistics (must be before /:id route)
router.get('/users/stats', AdminController.getUserStats);

// User CRUD
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.post(
    '/users',
    [
        // Accept full_name for admin-created users (tests use full_name)
        check('full_name', 'Full name is required').not().isEmpty(),
        check('email', 'Valid email is required').isEmail(),
        check('role', 'Role is required').isIn(['admin', 'resident', 'staff']),
        validate
    ],
    AdminController.createUser
);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// User status, role and salary management
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/salary', AdminController.updateSalary);

// Roles
router.get('/roles', AdminController.getAllRoles);

// ==================== UNIT MANAGEMENT ROUTES ====================
// Units
router.get('/units', UnitController.getAllUnits);
router.get('/units/:id', UnitController.getUnitById);
router.post('/units', UnitController.createUnit);
router.put('/units/:id', UnitController.updateUnit);
router.delete('/units/:id', UnitController.deleteUnit);

// Resident assignment
router.post('/units/:id/residents', UnitController.assignResident);
router.delete('/units/:id/residents/:userId', UnitController.removeResident);

// Blocks
router.get('/blocks', UnitController.getAllBlocks);
router.post('/blocks', UnitController.createBlock);
router.put('/blocks/:id', UnitController.updateBlock);
router.delete('/blocks/:id', UnitController.deleteBlock);

// ==================== REPORTS ROUTES ====================
router.get('/reports/dashboard', ReportController.getDashboardStats);
router.get('/reports/users', ReportController.getUserReport);
router.get('/reports/units', ReportController.getUnitReport);
router.get('/reports/finance', ReportController.getFinanceReport);
router.get('/reports/maintenance', ReportController.getMaintenanceReport);
router.get('/reports/visitors', ReportController.getVisitorReport);

// ==================== SYSTEM CONFIG ROUTES ====================
// Seed defaults (must be before other routes)
router.post('/config/seed', ConfigController.seedDefaults);

// Config by key (must be before /:category route)
router.get('/config/key/:key', ConfigController.getConfigByKey);

// Config CRUD
router.get('/config', ConfigController.getAllConfigs);
router.get('/config/:category', ConfigController.getConfigsByCategory);
router.post('/config', ConfigController.createConfig);
router.put('/config/:key', ConfigController.updateConfig);
router.delete('/config/:key', ConfigController.deleteConfig);

// ==================== AUDIT LOGS ROUTES ====================
// Special routes (must be before /:id route)
router.get('/audit-logs/stats', AuditController.getStats);
router.get('/audit-logs/search', AuditController.searchLogs);
router.get('/audit-logs/recent', AuditController.getRecentLogs);
router.get('/audit-logs/user/:userId', AuditController.getLogsByUser);
router.get('/audit-logs/resource/:resourceType/:resourceId', AuditController.getLogsByResource);

// General audit log routes
router.get('/audit-logs', AuditController.getAllLogs);
router.get('/audit-logs/:id', AuditController.getLogById);

module.exports = router;
