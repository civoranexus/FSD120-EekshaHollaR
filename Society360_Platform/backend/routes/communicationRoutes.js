const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

// Import controllers
const {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
} = require('../controllers/announcementController');

const {
    postMessage,
    getMessages,
    deleteMessage,
    flagMessage
} = require('../controllers/messageController');

const {
    getUserNotifications,
    markNotificationRead
} = require('../controllers/notificationController');

const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Announcement routes
router.post(
    '/announcements',
    protect,
    authorize('admin'),
    [
        check('title', 'Title is required').not().isEmpty(),
        check('content', 'Content is required').not().isEmpty(),
        validate
    ],
    createAnnouncement
);
router.get('/announcements', protect, getAnnouncements);
router.delete('/announcements/:id', protect, authorize('admin'), deleteAnnouncement);

// Message board routes
router.post(
    '/messages',
    protect,
    [
        check('content', 'Message content is required').not().isEmpty(),
        validate
    ],
    postMessage
);
router.get('/messages', protect, getMessages);
router.delete('/messages/:id', protect, deleteMessage);
router.put('/messages/:id/flag', protect, authorize('admin'), flagMessage);

// Notification routes
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
