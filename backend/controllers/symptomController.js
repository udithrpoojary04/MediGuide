const SymptomReport = require('../models/SymptomReport');
const aiService = require('../services/aiService');
const emergencyScreeningService = require('../services/emergencyScreeningService');

// @desc    Process a symptom message and get AI response
// @route   POST /api/symptoms/message
// @access  Private
const processMessage = async (req, res, next) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400);
      return next(new Error('Messages array is required'));
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage.role === 'user') {
      // Deterministic Emergency Screening
      const screeningResult = emergencyScreeningService.screenInput(latestMessage.content);
      
      if (screeningResult.isEmergency) {
        return res.json({
          success: true,
          data: {
            type: 'result',
            data: {
              summary: 'Potential Medical Emergency Detected',
              possibleExplanations: [
                {
                  name: 'Urgent Medical Condition',
                  description: 'The symptoms described may indicate a life-threatening medical emergency.',
                  confidence: 'high'
                }
              ],
              urgency: {
                level: 'emergency',
                reason: screeningResult.reason
              },
              selfCareInformation: [
                'Do not wait.',
                'Do not drive yourself to the hospital.'
              ],
              warningSigns: ['Severe symptoms as described in your message.'],
              recommendedAction: 'Call emergency services (e.g., 911 or your local emergency number) or go to the nearest emergency room immediately.'
            }
          }
        });
      }
    }

    // Pass to AI Service
    const aiResponse = await aiService.analyzeSymptoms(messages);
    
    // If the AI returned a final result, we can optionally save it right away, 
    // but usually we might let the client explicitly save it via another endpoint or do it here.
    // For now, let's just return the response to the client.
    
    res.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Save a completed symptom report
// @route   POST /api/symptoms/save
// @access  Private
const saveReport = async (req, res, next) => {
  try {
    const { conversation, result } = req.body;
    
    if (!result) {
      res.status(400);
      return next(new Error('Result data is required'));
    }

    const report = await SymptomReport.create({
      userId: req.user._id,
      conversation: conversation || [],
      summary: result.summary,
      possibleExplanations: result.possibleExplanations,
      urgency: result.urgency,
      selfCareInformation: result.selfCareInformation,
      warningSigns: result.warningSigns,
      recommendedAction: result.recommendedAction,
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's symptom history
// @route   GET /api/symptoms/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const history = await SymptomReport.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single symptom report
// @route   GET /api/symptoms/:id
// @access  Private
const getReport = async (req, res, next) => {
  try {
    const report = await SymptomReport.findById(req.params.id);
    
    if (!report) {
      res.status(404);
      return next(new Error('Report not found'));
    }
    
    // Check ownership
    if (report.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      return next(new Error('Not authorized to access this report'));
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single symptom report
// @route   DELETE /api/symptoms/:id
// @access  Private
const deleteReport = async (req, res, next) => {
  try {
    const report = await SymptomReport.findById(req.params.id);
    
    if (!report) {
      res.status(404);
      return next(new Error('Report not found'));
    }
    
    // Check ownership
    if (report.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      return next(new Error('Not authorized to delete this report'));
    }
    
    await report.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all symptom history for user
// @route   DELETE /api/symptoms/history
// @access  Private
const deleteAllHistory = async (req, res, next) => {
  try {
    await SymptomReport.deleteMany({ userId: req.user._id });
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processMessage,
  saveReport,
  getHistory,
  getReport,
  deleteReport,
  deleteAllHistory
};
