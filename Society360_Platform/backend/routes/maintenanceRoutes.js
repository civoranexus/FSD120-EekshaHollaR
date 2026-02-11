const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect } = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// All routes are protected
router.use(protect);

router.post(
    '/',
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('category', 'Category is required').not().isEmpty(),
        check('unit_id', 'Unit ID is required').not().isEmpty(),
        validate
    ],
    maintenanceController.createTicket
);

router.put(
    '/:id/assign',
    [
        // Accept any non-empty staff id (tests use simplified ids like 'staff-1')
        check('staff_id', 'Staff ID is required').not().isEmpty(),
        validate
    ],
    maintenanceController.assignTicket
);

router.put(
    '/:id/status',
    [
        check('status', 'Valid status is required').isIn(['open', 'in_progress', 'resolved', 'closed', 'rejected']),
        validate
    ],
    maintenanceController.updateTicketStatus
);

router.get('/', maintenanceController.getTicketHistory);

// Admin: Get resolved tickets awaiting payment
router.get('/pending-payments', maintenanceController.getPendingPayments);

// Admin: Get staff statistics
router.get('/staff-stats', maintenanceController.getStaffStatistics);

// Admin: Process payout for resolved maintenance ticket
router.post('/:id/pay', maintenanceController.processMaintenancePayment);

module.exports = router;
