const db = require('../config/db');

/**
 * Log an audit entry to the audit_logs table
 * @param {string} userId - UUID of the user performing the action
 * @param {string} action - Action performed (e.g., 'USER_CREATED', 'UNIT_UPDATED')
 * @param {string} resourceType - Type of resource affected (e.g., 'users', 'units')
 * @param {string} resourceId - UUID of the affected resource
 * @param {object} details - Additional details (previous values, metadata)
 * @param {object} req - Express request object (for IP and user agent)
 */
const logAudit = async (userId, action, resourceType, resourceId, details = {}, req = null) => {
    // Skip audit logging during automated tests to avoid interfering with mocked DB sequences
    if (process.env.NODE_ENV === 'test') return null;

    try {
        const ipAddress = req ? (req.ip || req.connection.remoteAddress) : null;
        const userAgent = req ? req.get('user-agent') : null;

        const query = `
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            userId,
            action,
            resourceType,
            resourceId || null,
            ipAddress,
            userAgent,
            JSON.stringify(details)
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        // Don't throw error - audit logging should not break the main flow
        console.error('Audit logging failed:', error);
        return null;
    }
};

/**
 * Common audit actions constants
 */
const AUDIT_ACTIONS = {
    // User actions
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
    USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',

    // Unit actions
    UNIT_CREATED: 'UNIT_CREATED',
    UNIT_UPDATED: 'UNIT_UPDATED',
    UNIT_DELETED: 'UNIT_DELETED',
    RESIDENT_ASSIGNED: 'RESIDENT_ASSIGNED',
    RESIDENT_REMOVED: 'RESIDENT_REMOVED',

    // Block actions
    BLOCK_CREATED: 'BLOCK_CREATED',
    BLOCK_UPDATED: 'BLOCK_UPDATED',
    BLOCK_DELETED: 'BLOCK_DELETED',

    // Configuration actions
    CONFIG_UPDATED: 'CONFIG_UPDATED',
    CONFIG_CREATED: 'CONFIG_CREATED',
    CONFIG_DELETED: 'CONFIG_DELETED',

    // Maintenance actions
    TICKET_CREATED: 'TICKET_CREATED',
    TICKET_UPDATED: 'TICKET_UPDATED',
    TICKET_ASSIGNED: 'TICKET_ASSIGNED',
    TICKET_RESOLVED: 'TICKET_RESOLVED',

    // Finance actions
    BILL_CREATED: 'BILL_CREATED',
    PAYMENT_RECORDED: 'PAYMENT_RECORDED',

    // Visitor actions
    VISITOR_APPROVED: 'VISITOR_APPROVED',
    VISITOR_DENIED: 'VISITOR_DENIED',
    VISITOR_CHECKED_IN: 'VISITOR_CHECKED_IN',
    VISITOR_CHECKED_OUT: 'VISITOR_CHECKED_OUT',

    // Communication actions
    ANNOUNCEMENT_CREATED: 'ANNOUNCEMENT_CREATED',
    ANNOUNCEMENT_UPDATED: 'ANNOUNCEMENT_UPDATED',
    ANNOUNCEMENT_DELETED: 'ANNOUNCEMENT_DELETED',
    MESSAGE_POSTED: 'MESSAGE_POSTED',
    MESSAGE_DELETED: 'MESSAGE_DELETED'
};

module.exports = {
    logAudit,
    AUDIT_ACTIONS
};
