const express = require('express');
const router = express.Router();
const { 
  processMessage, 
  saveReport, 
  getHistory, 
  getReport, 
  deleteReport, 
  deleteAllHistory 
} = require('../controllers/symptomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/message', protect, processMessage);
router.post('/save', protect, saveReport);
router.get('/history', protect, getHistory);
router.delete('/history', protect, deleteAllHistory);
router.route('/:id').get(protect, getReport).delete(protect, deleteReport);

module.exports = router;
