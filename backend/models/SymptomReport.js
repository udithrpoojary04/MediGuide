const mongoose = require('mongoose');

const symptomReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    conversation: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      }
    ],
    summary: { type: String },
    possibleExplanations: [
      {
        name: String,
        description: String,
        confidence: String,
      }
    ],
    urgency: {
      level: {
        type: String,
        enum: ['routine', 'soon', 'urgent', 'emergency'],
      },
      reason: String,
    },
    selfCareInformation: [String],
    warningSigns: [String],
    recommendedAction: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SymptomReport', symptomReportSchema);
