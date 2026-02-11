const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
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

// Admin only: Create expense
router.post(
    '/',
    protect,
    authorize('admin'),
    [
        check('expense_type', 'Expense type is required').isIn(['salary', 'maintenance', 'utility', 'other']),
        check('category', 'Category is required').notEmpty(),
        check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
        validate
    ],
    expenseController.createExpense
);

// Admin and Staff: Get all expenses (staff sees only their own)
router.get(
    '/',
    protect,
    authorize('admin', 'staff'),
    expenseController.getExpenses
);

// Admin: Get expense by ID
router.get(
    '/:id',
    protect,
    authorize('admin'),
    expenseController.getExpenseById
);

// Staff: Get their own expenses and performance
router.get(
    '/staff/my-expenses',
    protect,
    authorize('staff'),
    expenseController.getStaffExpenses
);

// Admin: Get specific staff expenses and performance
router.get(
    '/staff/:staff_id',
    protect,
    authorize('admin'),
    expenseController.getStaffExpenses
);

// Admin: Update payment status
router.put(
    '/:id/payment',
    protect,
    authorize('admin'),
    [
        check('payment_status', 'Payment status is required').isIn(['pending', 'paid', 'cancelled']),
        validate
    ],
    expenseController.updatePaymentStatus
);

// Admin: Get expense statistics
router.get(
    '/reports/stats',
    protect,
    authorize('admin'),
    expenseController.getExpenseStats
);

// Admin: Get staff performance metrics
router.get(
    '/performance/:staff_id',
    protect,
    authorize('admin'),
    expenseController.getStaffPerformance
);

// Admin: Delete expense
router.delete(
    '/:id',
    protect,
    authorize('admin'),
    expenseController.deleteExpense
);

// Admin: Batch generate monthly salaries
router.post(
    '/generate-salaries',
    protect,
    authorize('admin'),
    [
        check('month', 'Month must be between 1-12').isInt({ min: 1, max: 12 }),
        check('year', 'Year is required').isInt({ min: 2024 }),
        validate
    ],
    expenseController.generateMonthlySalaries
);

module.exports = router;
