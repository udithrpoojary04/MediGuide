const axios = require('axios');
const AIProvider = require('./provider');

class GroqProvider extends AIProvider {
  constructor(apiKey, model = 'llama3-70b-8192') {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async generateResponse(messages, isJson = false) {
    try {
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
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new Error('Failed to communicate with Groq API');
    }
  }
}

module.exports = GroqProvider;
