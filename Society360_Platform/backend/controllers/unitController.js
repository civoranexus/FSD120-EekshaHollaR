const Unit = require('../models/unitModel');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

const UnitController = {
    // ==================== UNIT MANAGEMENT ====================

    /**
     * Get all units with filters
     * GET /api/admin/units?page=1&limit=10&block_id=xxx&status=occupied&type=2BHK
     */
    getAllUnits: async (req, res) => {
        try {
            const { page, limit, block_id, status, type } = req.query;
            const result = await Unit.getAllWithFilters({ page, limit, block_id, status, type });

            // Define Rate Card
            const RATES = {
                '1BHK': { maintenance: 1500, rent: 12000 },
                '2BHK': { maintenance: 2500, rent: 20000 },
                '3BHK': { maintenance: 3500, rent: 30000 },
                'Villa': { maintenance: 5000, rent: 50000 }
            };

            const unitsWithRates = result.units.map(unit => {
                const rates = RATES[unit.type] || { maintenance: 2000, rent: 15000 };
                return {
                    ...unit,
                    suggested_maintenance: unit.maintenance_amount > 0 ? unit.maintenance_amount : rates.maintenance,
                    suggested_rent: unit.rent_amount > 0 ? unit.rent_amount : rates.rent
                };
            });

            res.status(200).json({
                success: true,
                data: unitsWithRates, // Return modified data
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error fetching units:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch units', error: error.message });
        }
    },

    /**
     * Get unit by ID with residents
     * GET /api/admin/units/:id
     */
    getUnitById: async (req, res) => {
        try {
            const { id } = req.params;
            const unit = await Unit.getWithResidents(id);

            if (!unit) {
                return res.status(404).json({ success: false, message: 'Unit not found' });
            }

            res.status(200).json({ success: true, data: unit });
        } catch (error) {
            console.error('Error fetching unit:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch unit', error: error.message });
        }
    },

    /**
     * Create new unit
     * POST /api/admin/units
     */
    createUnit: async (req, res) => {
        try {
            const { block_id, unit_number, floor_number, type, status, maintenance_amount, rent_amount } = req.body;

            if (!block_id || !unit_number || !floor_number || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: block_id, unit_number, floor_number, type'
                });
            }

            const newUnit = await Unit.create({ block_id, unit_number, floor_number, type, status, maintenance_amount, rent_amount });

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.UNIT_CREATED, 'units', newUnit.id, { unit: newUnit }, req);

            res.status(201).json({
                success: true,
                message: 'Unit created successfully',
                data: newUnit
            });
        } catch (error) {
            console.error('Error creating unit:', error);
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'Unit number already exists in this block' });
            }
            res.status(500).json({ success: false, message: 'Failed to create unit', error: error.message });
        }
    },

    /**
     * Update unit
     * PUT /api/admin/units/:id
     */
    updateUnit: async (req, res) => {
        try {
            const { id } = req.params;
            const { unit_number, floor_number, type, status, maintenance_amount, rent_amount } = req.body;

            const updatedUnit = await Unit.update(id, { unit_number, floor_number, type, status, maintenance_amount, rent_amount });

            if (!updatedUnit) {
                return res.status(404).json({ success: false, message: 'Unit not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.UNIT_UPDATED, 'units', id, { unit: updatedUnit }, req);

            res.status(200).json({
                success: true,
                message: 'Unit updated successfully',
                data: updatedUnit
            });
        } catch (error) {
            console.error('Error updating unit:', error);
            res.status(500).json({ success: false, message: 'Failed to update unit', error: error.message });
        }
    },

    /**
     * Delete unit
     * DELETE /api/admin/units/:id
     */
    deleteUnit: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedUnit = await Unit.delete(id);

            if (!deletedUnit) {
                return res.status(404).json({ success: false, message: 'Unit not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.UNIT_DELETED, 'units', id, { unit: deletedUnit }, req);

            res.status(200).json({
                success: true,
                message: 'Unit deleted successfully',
                data: deletedUnit
            });
        } catch (error) {
            console.error('Error deleting unit:', error);
            res.status(500).json({ success: false, message: 'Failed to delete unit', error: error.message });
        }
    },

    // ==================== BLOCK MANAGEMENT ====================

    /**
     * Get all blocks
     * GET /api/admin/blocks
     */
    getAllBlocks: async (req, res) => {
        try {
            const blocks = await Unit.getAllBlocks();
            res.status(200).json({ success: true, data: blocks });
        } catch (error) {
            console.error('Error fetching blocks:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch blocks', error: error.message });
        }
    },

    /**
     * Create new block
     * POST /api/admin/blocks
     */
    createBlock: async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({ success: false, message: 'Block name is required' });
            }

            const newBlock = await Unit.createBlock({ name, description });

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.BLOCK_CREATED, 'blocks', newBlock.id, { block: newBlock }, req);

            res.status(201).json({
                success: true,
                message: 'Block created successfully',
                data: newBlock
            });
        } catch (error) {
            console.error('Error creating block:', error);
            res.status(500).json({ success: false, message: 'Failed to create block', error: error.message });
        }
    },

    /**
     * Update block
     * PUT /api/admin/blocks/:id
     */
    updateBlock: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const updatedBlock = await Unit.updateBlock(id, { name, description });

            if (!updatedBlock) {
                return res.status(404).json({ success: false, message: 'Block not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.BLOCK_UPDATED, 'blocks', id, { block: updatedBlock }, req);

            res.status(200).json({
                success: true,
                message: 'Block updated successfully',
                data: updatedBlock
            });
        } catch (error) {
            console.error('Error updating block:', error);
            res.status(500).json({ success: false, message: 'Failed to update block', error: error.message });
        }
    },

    /**
     * Delete block
     * DELETE /api/admin/blocks/:id
     */
    deleteBlock: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedBlock = await Unit.deleteBlock(id);

            if (!deletedBlock) {
                return res.status(404).json({ success: false, message: 'Block not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.BLOCK_DELETED, 'blocks', id, { block: deletedBlock }, req);

            res.status(200).json({
                success: true,
                message: 'Block deleted successfully',
                data: deletedBlock
            });
        } catch (error) {
            console.error('Error deleting block:', error);
            res.status(500).json({ success: false, message: 'Failed to delete block', error: error.message });
        }
    },

    // ==================== RESIDENT ASSIGNMENT ====================

    /**
     * Assign resident to unit
     * POST /api/admin/units/:id/residents
     */
    assignResident: async (req, res) => {
        try {
            const { id } = req.params;
            const { user_id, resident_type, is_primary_contact, move_in_date } = req.body;

            if (!user_id || !resident_type) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: user_id, resident_type'
                });
            }

            const unit = await Unit.findById(id);
            if (!unit) {
                return res.status(404).json({ success: false, message: 'Unit not found' });
            }

            if (unit.status === 'under_maintenance') {
                return res.status(400).json({ success: false, message: 'Unit is under maintenance and cannot be assigned' });
            }

            if (!['owner', 'tenant', 'family_member'].includes(resident_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid resident_type. Must be: owner, tenant, or family_member'
                });
            }

            // If this is a new owner or tenant, deallocate previous residents as per requirements
            if (['owner', 'tenant'].includes(resident_type)) {
                await Unit.deallocateUnit(id);
            }

            const assignment = await Unit.assignResident({
                user_id,
                unit_id: id,
                resident_type,
                is_primary_contact,
                move_in_date
            });

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.RESIDENT_ASSIGNED, 'user_units', assignment.id, {
                unit_id: id,
                user_id,
                resident_type
            }, req);

            res.status(201).json({
                success: true,
                message: 'Resident assigned successfully',
                data: assignment
            });
        } catch (error) {
            console.error('Error assigning resident:', error);
            res.status(500).json({ success: false, message: 'Failed to assign resident', error: error.message });
        }
    },

    /**
     * Remove resident from unit
     * DELETE /api/admin/units/:id/residents/:userId
     */
    removeResident: async (req, res) => {
        try {
            const { id, userId } = req.params;

            const result = await Unit.removeResident(id, userId);

            if (!result) {
                return res.status(404).json({ success: false, message: 'Resident assignment not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.RESIDENT_REMOVED, 'user_units', result.id, {
                unit_id: id,
                user_id: userId
            }, req);

            res.status(200).json({
                success: true,
                message: 'Resident removed successfully',
                data: result
            });
        } catch (error) {
            console.error('Error removing resident:', error);
            res.status(500).json({ success: false, message: 'Failed to remove resident', error: error.message });
        }
    },

    // ==================== RESIDENT METHODS ====================

    /**
     * Get units for the current logged in user
     * GET /api/units/my
     */
    getMyUnits: async (req, res) => {
        try {
            const units = await Unit.findUnitsByUser(req.user.id);

            // For each unit, get full details
            const detailedUnits = await Promise.all(
                units.map(u => Unit.getWithResidents(u.id))
            );

            res.status(200).json({
                success: true,
                data: detailedUnits
            });
        } catch (error) {
            console.error('Error fetching my units:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch your units', error: error.message });
        }
    }
};

module.exports = UnitController;
