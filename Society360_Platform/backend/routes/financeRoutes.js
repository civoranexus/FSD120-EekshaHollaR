const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Admin only: Generate bills
router.post(
    '/generate',
    protect,
    authorize('admin', 'staff'),
    [
        check('unit_id', 'Unit ID is required').not().isEmpty(),
        check('bill_type', 'Bill type is required').not().isEmpty(),
        check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
        validate
    ],
    financeController.generateMonthlyBills
);

// Admin & Resident: Get bills
router.get('/', protect, financeController.getBills);

// Resident only: Pay bill
router.post(
    '/pay',
    protect,
    authorize('resident'),
    [
        check('bill_id', 'Bill ID is required').not().isEmpty(),
        check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
        check('payment_method', 'Payment method is required').not().isEmpty(),
        validate
    ],
    financeController.payBill
);

// Authenticated: Get receipt
router.get('/receipt/:paymentId', protect, financeController.getReceipt);

// Admin only: Financial Reports
router.get('/reports', protect, authorize('admin'), financeController.getFinancialReports);

module.exports = router;
