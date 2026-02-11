const Notification = require('../models/notificationModel');

// @desc    Get user notifications
// @route   GET /api/communication/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
    try {
        console.log(`Fetching notifications for user: ${req.user.id}`);
        const notifications = await Notification.getByUser(req.user.id);
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/communication/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
    try {
        const updated = await Notification.markAsRead(req.params.id);
        if (updated) {
            res.json({
                success: true,
                message: 'Notification marked as read',
                data: updated
            });
        } else {
            res.status(404).json({ success: false, message: 'Notification not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationRead
};
