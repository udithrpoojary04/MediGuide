const User = require('../models/User');
const SymptomReport = require('../models/SymptomReport');

// @desc    Get aggregate statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const totalAnalyses = await SymptomReport.countDocuments();
    
    // Analyses per urgency level
    const urgencyStats = await SymptomReport.aggregate([
      { $match: { 'urgency.level': { $exists: true } } },
      { $group: { _id: '$urgency.level', count: { $sum: 1 } } }
    ]);

    // Format urgency stats
    const urgencyCounts = {
      routine: 0,
      soon: 0,
      urgent: 0,
      emergency: 0
    };

    urgencyStats.forEach(stat => {
      if (urgencyCounts[stat._id] !== undefined) {
        urgencyCounts[stat._id] = stat.count;
      }
    });

    res.json({
      success: true,
      data: {
        users: userCount,
        analyses: totalAnalyses,
        urgencyCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
