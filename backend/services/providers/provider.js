class AIProvider {
  constructor() {
    if (this.constructor === AIProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  async generateResponse(messages) {
    throw new Error("Method 'generateResponse()' must be implemented.");
  }
}

module.exports = AIProvider;
