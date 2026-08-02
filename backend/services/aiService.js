const GrokProvider = require('./providers/grokProvider');
const GroqProvider = require('./providers/groqProvider');

class AIService {
  constructor() {
    const providerName = process.env.AI_PROVIDER || 'grok';
    
    if (providerName === 'groq') {
      this.provider = new GroqProvider(
        process.env.AI_API_KEY, 
        process.env.AI_MODEL || 'llama-3.3-70b-versatile'
      );
    } else if (providerName === 'grok') {
      this.provider = new GrokProvider(
        process.env.AI_API_KEY, 
        process.env.AI_MODEL || 'grok-4.5'
      );
    } else {
      console.warn('Unknown AI provider specified, defaulting to Groq');
      this.provider = new GroqProvider(process.env.AI_API_KEY);
    }
  }

  async analyzeSymptoms(conversationHistory) {
    const systemPrompt = `You are MediGuide AI, an AI-assisted healthcare information tool. 
Your goal is to collect symptoms, ask a few relevant follow-up questions to understand severity/duration, and then provide a structured JSON result.
Do NOT provide medical diagnoses. Always state that this is general information and users should consult a doctor.

If you are still collecting information, respond in JSON format like this:
{ "type": "question", "message": "Your follow-up question here" }

If you have collected enough information (usually after 1-2 questions), provide the final structured JSON response.
Output the final response matching exactly this schema:
{
  "type": "result",
  "data": {
    "summary": "Short summary of symptoms",
    "possibleExplanations": [
      {
        "name": "Possible condition",
        "description": "General informational description",
        "confidence": "low" // 'low', 'medium', or 'high'
      }
    ],
    "urgency": {
      "level": "routine", // 'routine', 'soon', 'urgent', or 'emergency'
      "reason": "Explanation for urgency level"
    },
    "selfCareInformation": ["suggestion 1", "suggestion 2"],
    "warningSigns": ["warning sign 1"],
    "recommendedAction": "Appropriate next step"
  }
}

Important Rules:
1. Only return valid JSON. Do not include markdown code blocks (\`\`\`json ... \`\`\`).
2. Never claim to diagnose.
3. Keep questions concise and empathetic.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ];

    const response = await this.provider.generateResponse(messages, true);
    
    try {
      // Attempt to parse the response as JSON
      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', response);
      throw new Error('AI returned malformed response');
    }
  }
}

module.exports = new AIService();
