const Expense = require('../models/expenseModel');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

// Create a new expense
exports.createExpense = async (req, res) => {
    try {
        const {
            expense_type, category, amount, description, staff_id,
            maintenance_ticket_id, payment_status, payment_date,
            payment_method, transaction_reference, period_month,
            period_year, notes
        } = req.body;

        console.log('💵 Creating expense:', { expense_type, category, amount, staff_id });

        const expense = await Expense.create({
            expense_type,
            category,
            amount,
            description,
            staff_id,
            maintenance_ticket_id,
            payment_status,
            payment_date,
            payment_method,
            transaction_reference,
            period_month,
            period_year,
            recorded_by_id: req.user.id,
            notes
        });

        console.log('✅ Expense created:', expense.id);

        // Log audit
        await logAudit(
            req.user.id,
            'EXPENSE_CREATED',
            'expenses',
            expense.id,
            { expense_type, amount, staff_id },
            req
        );

        res.status(201).json({
            success: true,
            message: 'Expense recorded successfully',
            data: expense
        });
    } catch (error) {
        console.error('❌ Error creating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating expense',
            error: error.message
        });
    }
};

// Get all expenses with optional filters
exports.getExpenses = async (req, res) => {
    try {
        const filters = {
            expense_type: req.query.expense_type,
            staff_id: req.query.staff_id,
            payment_status: req.query.payment_status,
            period_month: req.query.period_month ? parseInt(req.query.period_month) : null,
            period_year: req.query.period_year ? parseInt(req.query.period_year) : null
        };

        // Remove null/undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === null || filters[key] === undefined) {
                delete filters[key];
            }
        });

        const expenses = await Expense.getAll(filters);

        res.json({
            success: true,
            data: expenses,
            count: expenses.length
        });
    } catch (error) {
        console.error('❌ Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching expenses'
        });
    }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.getById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('❌ Error fetching expense:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching expense'
        });
    }
};

// Get staff member's expenses (salaries and maintenance work)
exports.getStaffExpenses = async (req, res) => {
    try {
        const staffId = req.user.role === 'staff' ? req.user.id : req.params.staff_id;

        if (!staffId) {
            return res.status(400).json({
                success: false,
                message: 'Staff ID is required'
            });
        }

        const expenses = await Expense.getByStaff(staffId);
        const performance = await Expense.getStaffPerformance(staffId);

        res.json({
            success: true,
            data: {
                expenses,
                performance: {
                    tasks_completed: performance.maintenance_tasks_completed || 0,
                    total_maintenance_value: parseFloat(performance.total_maintenance_value || 0),
                    total_salary_paid: parseFloat(performance.total_salary_paid || 0),
                    salary_payment_count: performance.salary_payments || 0
                }
            }
        });
    } catch (error) {
        console.error('❌ Error fetching staff expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching staff expenses'
        });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, payment_date, payment_method, transaction_reference } = req.body;

        console.log('💳 Updating payment status:', { id, payment_status });

        const expense = await Expense.updatePaymentStatus(id, payment_status, {
            payment_date,
            payment_method,
            transaction_reference
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        console.log('✅ Payment status updated');

        // Log audit
        await logAudit(
            req.user.id,
            'EXPENSE_PAYMENT_UPDATED',
            'expenses',
            id,
            { payment_status, payment_method },
            req
        );

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('❌ Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating payment status'
        });
    }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
    try {
        const filters = {
            period_month: req.query.period_month ? parseInt(req.query.period_month) : null,
            period_year: req.query.period_year ? parseInt(req.query.period_year) : null
        };

        // Remove null filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === null) delete filters[key];
        });

        const stats = await Expense.getStats(filters);

        // Calculate totals
        const totals = {
            total_expenses: 0,
            total_paid: 0,
            total_pending: 0,
            by_type: {}
        };

        stats.forEach(stat => {
            totals.total_expenses += parseFloat(stat.total_amount || 0);
            totals.total_paid += parseFloat(stat.paid_amount || 0);
            totals.total_pending += parseFloat(stat.pending_amount || 0);
            totals.by_type[stat.expense_type] = {
                total: parseFloat(stat.total_amount || 0),
                paid: parseFloat(stat.paid_amount || 0),
                pending: parseFloat(stat.pending_amount || 0),
                count: parseInt(stat.count || 0)
            };
        });

        res.json({
            success: true,
            data: totals
        });
    } catch (error) {
        console.error('❌ Error fetching expense stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching expense statistics'
        });
    }
};

// Get staff performance metrics
exports.getStaffPerformance = async (req, res) => {
    try {
        const { staff_id } = req.params;
        const { period_year, period_month } = req.query;

        const performance = await Expense.getStaffPerformance(
            staff_id,
            period_year ? parseInt(period_year) : null,
            period_month ? parseInt(period_month) : null
        );

        res.json({
            success: true,
            data: {
                staff_id,
                tasks_completed: performance.maintenance_tasks_completed || 0,
                total_maintenance_value: parseFloat(performance.total_maintenance_value || 0),
                total_salary_paid: parseFloat(performance.total_salary_paid || 0),
                salary_payment_count: performance.salary_payments || 0,
                period: period_year && period_month ? {
                    year: parseInt(period_year),
                    month: parseInt(period_month)
                } : 'all_time'
            }
        });
    } catch (error) {
        console.error('❌ Error fetching staff performance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching staff performance'
        });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.delete(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Log audit
        await logAudit(
            req.user.id,
            'EXPENSE_DELETED',
            'expenses',
            id,
            { expense_type: expense.expense_type, amount: expense.amount },
            req
        );

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting expense'
        });
    }
};

// Generate monthly salaries for all staff
exports.generateMonthlySalaries = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        console.log(`💵 Generating salaries for ${month}/${year}`);

        const results = await Expense.generateMonthlySalaries(month, year, req.user.id);

        // Log audit
        await logAudit(
            req.user.id,
            'SALARIES_GENERATED',
            'expenses',
            null,
            { month, year, generated_count: results.generated },
            req
        );

        res.json({
            success: true,
            message: `Batch generation complete. Generated: ${results.generated}, Skipped: ${results.skipped}`,
            data: results
        });
    } catch (error) {
        console.error('❌ Error generating salaries:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating salaries',
            error: error.message
        });
    }
};
