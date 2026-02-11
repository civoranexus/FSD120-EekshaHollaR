const Finance = require('../models/financeModel');
const Unit = require('../models/unitModel');
const db = require('../config/db'); // Needed for transactions if complex validity checks are added later, for now model handles it.
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

exports.generateMonthlyBills = async (req, res) => {
    try {
        const { unit_id, bill_type, amount, description, bill_date, due_date } = req.body;

        const billDate = bill_date ? new Date(bill_date) : new Date();
        const dueDate = due_date ? new Date(due_date) : new Date();
        if (!due_date) {
            dueDate.setDate(dueDate.getDate() + 15); // Default 15 days
        }

        const newBill = await Finance.createBill({
            unit_id,
            bill_type,
            amount,
            bill_date: billDate,
            due_date: dueDate,
            description
        });

        // Log audit
        await logAudit(req.user.id, AUDIT_ACTIONS.BILL_CREATED, 'bills', newBill.id, { unit_id, amount, bill_type }, req);

        res.status(201).json({
            success: true,
            message: 'Bill generated successfully',
            data: newBill
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error generating bill' });
    }
};

exports.getBills = async (req, res) => {
    try {
        let bills = [];
        if (req.user.role === 'admin' || req.user.role === 'staff') {
            if (req.query.unit_id) {
                bills = await Finance.getBillsByUnit(req.query.unit_id);
            } else {
                bills = await Finance.getAllBills();
            }
        } else {
            let unitId = req.query.unit_id;
            if (!unitId) {
                const userUnits = await Unit.findUnitsByUser(req.user.id);
                if (userUnits && userUnits.length > 0) {
                    unitId = userUnits[0].id;
                }
            }

            if (!unitId) {
                // Return empty if no unit assigned
                return res.json({ success: true, data: [] });
            }

            bills = await Finance.getBillsByUnit(unitId);
        }

        // Add overdue logic
        const now = new Date();
        const billsWithStatus = bills.map(bill => {
            const dueDate = new Date(bill.due_date);
            // If unpaid and past due date
            if (bill.status === 'unpaid' && dueDate < now) {
                const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
                // Add fine? For now just mark as overdue in response, DB remains 'unpaid' unless we run a cron
                // But for UI "red" badge, this is enough
                return {
                    ...bill,
                    status: 'overdue', // UI can use this
                    days_overdue: daysOverdue,
                    fine_amount: daysOverdue * 50 // Example: 50 currency units per day
                };
            }
            return bill;
        });

        res.json({
            success: true,
            data: billsWithStatus
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error fetching bills' });
    }
};

exports.payBill = async (req, res) => {
    try {
        const { bill_id, payment_method, amount } = req.body;
        const payer_id = req.user.id; // From auth middleware

        console.log('💳 Payment request received:', { bill_id, amount, payment_method, payer_id });

        const bill = await Finance.getBillById(bill_id);
        if (!bill) {
            console.log('❌ Bill not found:', bill_id);
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        console.log('✅ Bill found:', { id: bill.id, amount: bill.amount, status: bill.status });

        if (bill.status === 'paid') {
            console.log('⚠️ Bill already paid:', bill_id);
            return res.status(400).json({ success: false, message: 'Bill is already paid' });
        }

        // Relaxed validation for prototype - allow small decimal differences
        const billAmount = parseFloat(bill.amount);
        const paymentAmount = parseFloat(amount);

        if (Math.abs(billAmount - paymentAmount) > 0.01) {
            console.log('❌ Amount mismatch:', { billAmount, paymentAmount, difference: Math.abs(billAmount - paymentAmount) });
            return res.status(400).json({
                success: false,
                message: `Payment amount ($${paymentAmount}) must match bill amount ($${billAmount})`
            });
        }

        // Simulate payment gateway processing
        console.log('🔄 Processing simulated payment...');
        const transaction_reference = `SIM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const payment = await Finance.createPayment({
            bill_id,
            payer_id,
            amount_paid: paymentAmount,
            payment_method: payment_method || 'simulated',
            transaction_reference
        });

        console.log('✅ Payment record created:', payment.id);

        await Finance.updateBillStatus(bill_id, 'paid');
        console.log('✅ Bill status updated to PAID');

        // Log audit
        await logAudit(payer_id, AUDIT_ACTIONS.PAYMENT_RECORDED, 'payments', payment.id, { bill_id, amount: paymentAmount, payment_method }, req);

        console.log('🎉 Payment completed successfully!');

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully (simulated transaction)',
            data: {
                ...payment,
                transaction_reference,
                bill_type: bill.bill_type,
                bill_amount: billAmount
            }
        });

    } catch (error) {
        console.error('❌ Payment processing error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server Error processing payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Finance.getPaymentById(paymentId);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // In a real app, verify user owns the payment or is admin

        res.json({
            success: true,
            data: {
                receipt_id: payment.id,
                date: payment.payment_date,
                amount: payment.amount_paid,
                method: payment.payment_method,
                transaction_ref: payment.transaction_reference,
                status: 'Verified'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error fetching receipt' });
    }
};

exports.getFinancialReports = async (req, res) => {
    try {
        const stats = await Finance.getFinancialStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error fetching reports' });
    }
};
