const Announcement = require('../models/announcementModel');
const Notification = require('../models/notificationModel');
const db = require('../config/db');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

// @desc    Create new announcement (Admin only)
// @route   POST /api/communication/announcements
// @access  Private/Admin
// @desc    Create new announcement (Admin only)
// @route   POST /api/communication/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    const { title, content, target_audience, is_important, expires_at } = req.body;

    try {
        const announcement = await Announcement.create({
            title,
            content,
            author_id: req.user.id,
            target_audience: target_audience || 'all',
            is_important,
            expires_at
        });

        // Log audit
        await logAudit(req.user.id, AUDIT_ACTIONS.ANNOUNCEMENT_CREATED, 'announcements', announcement.id, { title, target_audience }, req);

        // Determine who to notify
        let usersQuery = '';
        const queryParams = [];

        if (target_audience === 'resident') {
            usersQuery = "SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'resident')";
        } else if (target_audience === 'staff') {
            usersQuery = "SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'staff')";
        } else {
            // All users (except maybe admin themselves, but fine to notify all)
            usersQuery = "SELECT id FROM users";
        }

        const users = await db.query(usersQuery);

        const notificationPromises = users.rows.map(user =>
            Notification.create({
                user_id: user.id,
                type: 'announcement',
                message: `New announcement: ${title}`,
                reference_id: announcement.id
            })
        );

        await Promise.all(notificationPromises);

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all announcements
// @route   GET /api/communication/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        const allAnnouncements = await Announcement.getAll();
        const userRole = req.user.role;

        // Filter based on role
        let filteredAnnouncements = allAnnouncements;

        if (userRole === 'admin') {
            // Admin sees all
            filteredAnnouncements = allAnnouncements;
        } else if (userRole === 'resident') {
            filteredAnnouncements = allAnnouncements.filter(a =>
                a.target_audience === 'resident' || a.target_audience === 'all'
            );
        } else if (userRole === 'staff') {
            filteredAnnouncements = allAnnouncements.filter(a =>
                a.target_audience === 'staff' || a.target_audience === 'all'
            );
        }

        res.json({
            success: true,
            data: filteredAnnouncements
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete announcement (Admin only)
// @route   DELETE /api/communication/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const deleted = await Announcement.delete(req.params.id);
        if (deleted) {
            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.ANNOUNCEMENT_DELETED, 'announcements', req.params.id, {}, req);

            res.json({
                success: true,
                message: 'Announcement deleted'
            });
        } else {
            res.status(404).json({ success: false, message: 'Announcement not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
};
