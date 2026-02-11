const AdminModel = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

const AdminController = {
    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with pagination and filters
     * GET /api/admin/users?page=1&limit=10&role=admin&status=active&search=john
     */
    getAllUsers: async (req, res) => {
        try {
            const { page, limit, role, status, search } = req.query;
            const result = await AdminModel.getAllUsers({ page, limit, role, status, search });

            res.status(200).json({
                success: true,
                data: result.users,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
        }
    },

    /**
     * Get user by ID
     * GET /api/admin/users/:id
     */
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await AdminModel.getUserById(id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({ success: true, data: user });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
        }
    },

    /**
     * Create new user
     * POST /api/admin/users
     */
    createUser: async (req, res) => {
        try {
            const { full_name, email, password, phone_number, role, status, profile_picture_url } = req.body;

            console.log('createUser payload:', { full_name, email, role, status });

            // Validation
            if (!full_name || !email || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: full_name, email, password, role'
                });
            }

            // Get role ID
            const roleData = await AdminModel.getRoleByName(role);
            console.log('roleData fetched:', roleData);
            if (!roleData) {
                console.error('Create user failed: role not found for', role);
                return res.status(400).json({ success: false, message: 'Invalid role' });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);

            // Create user
            const userData = {
                full_name,
                email,
                password_hash,
                phone_number,
                role_id: roleData.id,
                status,
                profile_picture_url
            };

            const newUser = await AdminModel.createUser(userData);

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.USER_CREATED, 'users', newUser.id, { created_user: newUser }, req);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: newUser
            });
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
        }
    },

    /**
     * Update user details
     * PUT /api/admin/users/:id
     */
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { first_name, last_name, full_name, email, phone_number, status, profile_picture_url } = req.body;

            // Get old user data for audit
            const oldUser = await AdminModel.getUserById(id);
            if (!oldUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const updateData = {
                first_name,
                last_name,
                full_name,
                email,
                phone_number,
                status,
                profile_picture_url
            };

            // If role is provided, handle role update
            const { role } = req.body;
            if (role) {
                const roleData = await AdminModel.getRoleByName(role);
                if (roleData) {
                    await AdminModel.updateUserRole(id, roleData.id);
                }
            }

            const updatedUser = await AdminModel.updateUser(id, updateData);

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.USER_UPDATED, 'users', id, {
                old: oldUser,
                new: updatedUser
            }, req);

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
        }
    },

    /**
     * Update user status
     * PATCH /api/admin/users/:id/status
     */
    updateUserStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !['active', 'inactive', 'banned'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be: active, inactive, or banned'
                });
            }

            const updatedUser = await AdminModel.updateUserStatus(id, status);

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.USER_STATUS_CHANGED, 'users', id, {
                new_status: status
            }, req);

            res.status(200).json({
                success: true,
                message: 'User status updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
        }
    },

    /**
     * Update user role
     * PATCH /api/admin/users/:id/role
     */
    updateUserRole: async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({ success: false, message: 'Role is required' });
            }

            // Get role ID
            const roleData = await AdminModel.getRoleByName(role);
            if (!roleData) {
                return res.status(400).json({ success: false, message: 'Invalid role' });
            }

            const updatedUser = await AdminModel.updateUserRole(id, roleData.id);

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.USER_ROLE_CHANGED, 'users', id, {
                new_role: role
            }, req);

            res.status(200).json({
                success: true,
                message: 'User role updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
        }
    },

    /**
     * Delete user (soft delete)
     * DELETE /api/admin/users/:id
     */
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Prevent self-deletion
            if (id === req.user.id) {
                return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
            }

            const deletedUser = await AdminModel.deleteUser(id);

            if (!deletedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.USER_DELETED, 'users', id, {
                deleted_user: deletedUser
            }, req);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                data: deletedUser
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
        }
    },

    /**
     * Get user statistics
     * GET /api/admin/users/stats
     */
    getUserStats: async (req, res) => {
        try {
            const stats = await AdminModel.getUserStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user statistics', error: error.message });
        }
    },

    /**
     * Get all roles
     * GET /api/admin/roles
     */
    getAllRoles: async (req, res) => {
        try {
            const roles = await AdminModel.getAllRoles();
            res.status(200).json({ success: true, data: roles });
        } catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch roles', error: error.message });
        }
    },

    updateSalary: async (req, res) => {
        try {
            const { id } = req.params;
            const { base_salary } = req.body;

            if (base_salary === undefined || base_salary < 0) {
                return res.status(400).json({ success: false, message: 'Invalid salary amount' });
            }

            const updatedUser = await AdminModel.updateSalary(id, base_salary);

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.USER_UPDATED, 'users', id, {
                action: 'SALARY_UPDATE',
                new_salary: base_salary
            }, req);

            res.status(200).json({
                success: true,
                message: 'Salary updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating salary:', error);
            res.status(500).json({ success: false, message: 'Failed to update salary', error: error.message });
        }
    }
};

module.exports = AdminController;
