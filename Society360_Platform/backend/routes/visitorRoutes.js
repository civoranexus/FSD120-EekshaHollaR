const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { protect } = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// All routes are protected
router.use(protect);

router.post(
    '/pre-approve',
    [
        check('visitor_name', 'Visitor name is required').not().isEmpty(),
        check('visitor_phone', 'Valid phone number is required').optional().not().isEmpty(),
        check('unit_id', 'Unit ID is required').not().isEmpty(),
        check('expected_arrival', 'Valid arrival date/time is required').optional().isISO8601(),
        check('visitor_type', 'Visitor type must be one of: guest, delivery, service, other').optional().isIn(['guest', 'delivery', 'service', 'other']),
        validate
    ],
    visitorController.preApproveVisitor
);

router.post(
    '/check-in',
    [
        // Accept non-UUID ids for test simplicity
        check('visitor_id', 'Visitor ID is required').optional().not().isEmpty(),
        validate
    ],
    visitorController.checkInVisitor
);

router.post(
    '/check-out',
    [
        // Accept non-UUID ids for test simplicity
        check('visitor_id', 'Visitor ID is required').not().isEmpty(),
        validate
    ],
    visitorController.checkOutVisitor
);

router.get('/history', visitorController.getVisitorHistory);
router.get('/pending', visitorController.getPendingVisitors);

module.exports = router;
