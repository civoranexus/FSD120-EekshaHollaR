const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unitController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// Resident route to get their own units
router.get('/my', UnitController.getMyUnits);

module.exports = router;
