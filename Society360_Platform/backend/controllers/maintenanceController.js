const MaintenanceTicket = require('../models/maintenanceModel');
const Unit = require('../models/unitModel');
const User = require('../models/userModel');
const Expense = require('../models/expenseModel');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

const MaintenanceController = {
    createTicket: async (req, res) => {
        try {
            const { unit_id, category, title, description, priority } = req.body;
            const requesterId = req.user.id;

            // Verify resident owns/rents the unit
            const userUnits = await Unit.findUnitsByUser(requesterId);
            const isAuthorized = userUnits.some(u => u.id === unit_id);

            if (!isAuthorized && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized for this unit' });
            }

            const ticket = await MaintenanceTicket.create({
                unit_id,
                requester_id: requesterId,
                category,
                title,
                description,
                priority
            });

            // Log audit
            await logAudit(requesterId, AUDIT_ACTIONS.TICKET_CREATED, 'maintenance_tickets', ticket.id, { title, category, priority }, req);

            res.status(201).json({
                success: true,
                message: 'Ticket created successfully',
                data: ticket
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    assignTicket: async (req, res) => {
        try {
            const { id } = req.params;
            const { staff_id } = req.body;

            // Verify staff exists and is actually staff
            const staff = await User.findById(staff_id);
            console.log('Assign: staff lookup result:', staff);
            if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
                return res.status(400).json({ success: false, message: 'Invalid staff user' });
            }

            const ticket = await MaintenanceTicket.assign(id, staff_id);
            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.TICKET_ASSIGNED, 'maintenance_tickets', id, { assigned_to: staff_id }, req);

            res.json({
                success: true,
                message: 'Ticket assigned successfully',
                data: ticket
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    updateTicketStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, actual_cost } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // 1. Get current ticket to check ownership
            const currentTicket = await MaintenanceTicket.findById(id);
            if (!currentTicket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // 2. Logic: If task is in_progress, only the assigned person or admin can update it
            if (currentTicket.status !== 'open' && currentTicket.assigned_to_id !== userId && userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: `This task is already being handled by another staff member.`
                });
            }

            // 3. Auto-assign if status changes to in_progress from open
            if (currentTicket.status === 'open' && status === 'in_progress') {
                await MaintenanceTicket.assign(id, userId);
            }

            // 4. Validate status enum
            const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const ticket = await MaintenanceTicket.updateStatus(id, status, actual_cost);

            // Log audit
            const action = status === 'resolved' ? AUDIT_ACTIONS.TICKET_RESOLVED : AUDIT_ACTIONS.TICKET_UPDATED;
            await logAudit(userId, action, 'maintenance_tickets', id, { new_status: status, actual_cost }, req);

            res.json({
                success: true,
                message: 'Ticket status updated successfully',
                data: ticket
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getPendingPayments: async (req, res) => {
        try {
            const pending = await MaintenanceTicket.getPendingPayments();
            res.json({
                success: true,
                data: pending
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    processMaintenancePayment: async (req, res) => {
        try {
            const { id } = req.params;
            const { bonus_percentage = 10 } = req.body; // Default 10% bonus

            const ticket = await MaintenanceTicket.findById(id);
            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            if (ticket.status !== 'resolved') {
                return res.status(400).json({ success: false, message: 'Only resolved tickets can be paid' });
            }

            const amount = parseFloat(ticket.actual_cost || 0);
            const bonus = (amount * bonus_percentage) / 100;
            const totalAmount = amount + bonus;

            const now = new Date();
            const expense = await Expense.create({
                expense_type: 'maintenance',
                category: 'Maintenance Payout',
                amount: totalAmount,
                base_amount: amount,
                bonus_amount: bonus,
                description: `Payout for ticket: ${ticket.title}. Includes ${bonus_percentage}% bonus ($${bonus.toFixed(2)}).`,
                staff_id: ticket.assigned_to_id,
                maintenance_ticket_id: ticket.id,
                payment_status: 'paid',
                payment_date: now,
                period_month: now.getMonth() + 1,
                period_year: now.getFullYear(),
                recorded_by_id: req.user.id,
                notes: `Base cost: $${amount.toFixed(2)}, Bonus: $${bonus.toFixed(2)}`
            });

            // Update ticket status to closed
            await MaintenanceTicket.updateStatus(id, 'closed');

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.GENERAL, 'expenses', expense.id, {
                action: 'MAINTENANCE_PAYOUT',
                ticket_id: id,
                amount: totalAmount,
                bonus
            }, req);

            res.json({
                success: true,
                message: 'Maintenance payment processed successfully',
                data: expense
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getTicketHistory: async (req, res) => {
        try {
            const { role, id } = req.user;

            if (role === 'resident') {
                const userUnits = await Unit.findUnitsByUser(id);
                const history = [];
                for (const unit of userUnits) {
                    const tickets = await MaintenanceTicket.findByUnit(unit.id);
                    history.push(...tickets);
                }
                // Sort desc
                history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                return res.json({
                    success: true,
                    data: history
                });
            } else if (role === 'staff') {
                // Staff should see all tickets to pick them up or manage them
                const allTickets = await MaintenanceTicket.findAll();
                return res.json({
                    success: true,
                    data: allTickets
                });
            } else {
                // Admin sees all
                const allTickets = await MaintenanceTicket.findAll();
                return res.json({
                    success: true,
                    data: allTickets
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getStaffStatistics: async (req, res) => {
        try {
            const staffList = await MaintenanceTicket.getStaffList();
            res.json({
                success: true,
                data: staffList
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = MaintenanceController;
