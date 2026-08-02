class EmergencyScreeningService {
  constructor() {
    this.emergencyKeywords = [
      'severe difficulty breathing',
      'can\'t breathe',
      'unconsciousness',
      'passed out',
      'severe uncontrolled bleeding',
      'seizure',
      'severe chest pain',
      'heart attack',
      'signs of stroke',
      'face drooping',
      'arm weakness',
      'slurred speech',
      'severe allergic reaction',
      'anaphylaxis',
      'coughing up blood',
      'suicide',
      'kill myself'
    ];
  }

  screenInput(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const keyword of this.emergencyKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          isEmergency: true,
          reason: `Potential emergency detected related to: "${keyword}"`
        };
      }
    }

    return {
      isEmergency: false
    };
  }
}

module.exports = new EmergencyScreeningService();
