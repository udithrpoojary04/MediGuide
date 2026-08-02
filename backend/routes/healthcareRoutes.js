const express = require('express');
const router = express.Router();
const { getNearbyFacilities } = require('../controllers/healthcareController');
const { protect } = require('../middleware/authMiddleware');

router.get('/nearby', protect, getNearbyFacilities);

module.exports = router;
