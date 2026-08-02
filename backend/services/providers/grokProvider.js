const axios = require('axios');
const AIProvider = require('./provider');

class GrokProvider extends AIProvider {
  constructor(apiKey, model = 'grok-4.5') {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = 'https://api.x.ai/v1/chat/completions';
  }

  async generateResponse(messages, isJson = false) {
    try {
      // Structure expected by Grok/OpenAI
      const payload = {
        model: this.model,
        messages: messages,
      };

      if (isJson) {
        payload.response_format = { type: 'json_object' };
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Grok API Error:', error.response?.data || error.message);
      throw new Error('Failed to communicate with Grok API');
    }
  }
}

module.exports = GrokProvider;
