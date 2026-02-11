const Message = require('../models/messageModel');
const Notification = require('../models/notificationModel');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

// @desc    Post a new message
// @route   POST /api/communication/messages
// @access  Private
const postMessage = async (req, res) => {
    const { content, parent_id } = req.body;

    try {
        const message = await Message.create({
            content,
            user_id: req.user.id,
            parent_id
        });

        // Log audit
        await logAudit(req.user.id, AUDIT_ACTIONS.MESSAGE_POSTED, 'messages', message.id, { is_reply: !!parent_id }, req);

        // If this is a reply, notify the parent message author
        if (parent_id) {
            const parentQuery = 'SELECT user_id FROM messages WHERE id = $1';
            const parentResult = await require('../config/db').query(parentQuery, [parent_id]);

            if (parentResult.rows.length > 0) {
                const parentAuthorId = parentResult.rows[0].user_id;

                // Don't notify if replying to own message
                if (parentAuthorId !== req.user.id) {
                    await Notification.create({
                        user_id: parentAuthorId,
                        type: 'message_reply',
                        message: `${req.user.first_name} replied to your message`,
                        reference_id: message.id
                    });
                }
            }
        }

        res.status(201).json({
            success: true,
            message: 'Message posted successfully',
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all messages
// @route   GET /api/communication/messages
// @access  Private
const getMessages = async (req, res) => {
    try {
        const messages = await Message.getAll();
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete message (Admin or message owner)
// @route   DELETE /api/communication/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        // First check if message exists and get owner
        const checkQuery = 'SELECT user_id FROM messages WHERE id = $1';
        const checkResult = await require('../config/db').query(checkQuery, [req.params.id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        const messageOwnerId = checkResult.rows[0].user_id;

        // Allow deletion if user is admin (role_id = 1) or message owner
        if (req.user.role_id === 1 || req.user.id === messageOwnerId) {
            const deleted = await Message.delete(req.params.id);

            // Log audit
            await logAudit(req.user.id, AUDIT_ACTIONS.MESSAGE_DELETED, 'messages', req.params.id, { deleted_by: req.user.id }, req);

            res.json({
                success: true,
                message: 'Message deleted'
            });
        } else {
            res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Flag message as inappropriate (Admin only)
// @route   PUT /api/communication/messages/:id/flag
// @access  Private/Admin
const flagMessage = async (req, res) => {
    try {
        const flagged = await Message.flag(req.params.id);
        if (flagged) {
            // Log audit
            await logAudit(req.user.id, 'MESSAGE_FLAGGED', 'messages', req.params.id, {}, req);

            res.json({
                success: true,
                message: 'Message flagged',
                data: flagged
            });
        } else {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    postMessage,
    getMessages,
    deleteMessage,
    flagMessage
};
