const Visitor = require('../models/visitorModel');
const Unit = require('../models/unitModel');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

const VisitorController = {
    // Resident Action
    preApproveVisitor: async (req, res) => {
        try {
            const { visitor_name, visitor_phone, purpose, unit_id, expected_arrival, visitor_type, vehicle_number } = req.body;
            const userId = req.user.id; // From authMiddleware

            // Verify if the user is associated with the unit
            const userUnits = await Unit.findUnitsByUser(userId);
            const isAuthorized = userUnits.some(unit => unit.id === unit_id);

            if (!isAuthorized && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Not authorized for this unit' });
            }

            const visitor = await Visitor.create({
                unit_id,
                visitor_name,
                visitor_phone,
                purpose,
                approved_by_user_id: userId,
                status: 'approved',
                expected_arrival,
                visitor_type,
                vehicle_number
            });

            // Log audit
            await logAudit(userId, AUDIT_ACTIONS.VISITOR_APPROVED, 'visitor_logs', visitor.id, { visitor_name, unit_id }, req);

            res.status(201).json({
                success: true,
                message: 'Visitor pre-approved successfully',
                data: visitor
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // Staff/Admin Action
    checkInVisitor: async (req, res) => {
        try {
            const { visitor_id } = req.body;
            const securityGuardId = req.user.id;

            let visitor;
            if (visitor_id) {
                visitor = await Visitor.updateStatus(visitor_id, 'checked_in');
                // Log audit
                await logAudit(securityGuardId, AUDIT_ACTIONS.VISITOR_CHECKED_IN, 'visitor_logs', visitor_id, { method: 'PRE_APPROVED' }, req);
            } else {
                // Walk-in creation
                const { unit_id, visitor_name, visitor_phone, purpose } = req.body;
                visitor = await Visitor.create({
                    unit_id,
                    visitor_name,
                    visitor_phone,
                    purpose,
                    security_guard_id: securityGuardId,
                    status: 'checked_in'
                });
                // Log audit
                await logAudit(securityGuardId, AUDIT_ACTIONS.VISITOR_CHECKED_IN, 'visitor_logs', visitor.id, { method: 'WALK_IN', visitor_name, unit_id }, req);
            }

            console.log('Visitor check-in result:', visitor);
            res.json({
                success: true,
                message: 'Visitor checked in successfully',
                data: visitor
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    checkOutVisitor: async (req, res) => {
        try {
            const { visitor_id } = req.body;
            const visitor = await Visitor.updateStatus(visitor_id, 'checked_out', new Date());

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.VISITOR_CHECKED_OUT, 'visitor_logs', visitor_id, {}, req);

            res.json({
                success: true,
                message: 'Visitor checked out successfully',
                data: visitor
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getVisitorHistory: async (req, res) => {
        try {
            const { role, id } = req.user;

            if (role === 'resident') {
                const userUnits = await Unit.findUnitsByUser(id);
                const unitIds = userUnits.map(u => u.id);

                // Fetch for each unit and merge
                // This is checking history for one unit at a time or all?
                // Model has findByUnit. 
                // Let's just fetch for the first unit or support query param.
                // For simplicity, let's just return for all their units.
                const history = [];
                for (const unit of userUnits) {
                    const logs = await Visitor.findByUnit(unit.id);
                    history.push(...logs);
                }
                // Sort by date key if possible
                history.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));

                return res.json({
                    success: true,
                    data: history
                });
            } else {
                // Admin/Staff sees all
                const history = await Visitor.findAll();
                return res.json({
                    success: true,
                    data: history
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getPendingVisitors: async (req, res) => {
        try {
            // Staff/Admin usage
            // This would ideally be a new query 'status = approved'.
            // I'll implement a findAll and filter in JS for now to save a DB query addition,
            // or I should add findByStatus to model.
            // Model doesn't have findByStatus.
            // I'll filter in memory for MVP (assuming low volume) or add method later.
            const allVisitors = await Visitor.findAll();
            const pending = allVisitors.filter(v => v.status === 'approved' || v.status === 'pending');
            res.json({
                success: true,
                data: pending
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

module.exports = VisitorController;
