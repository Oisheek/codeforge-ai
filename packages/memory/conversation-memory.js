class ConversationMemory {
  constructor(maxMessages = 100) {
    this.messages = [];
    this.maxMessages = maxMessages;
  }

  add(role, content) {
    this.messages.push({ role, content, timestamp: Date.now() });
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getRecent(count = 20) {
    return this.messages.slice(-count);
  }

  getForContext(maxTokens = 8000) {
    // Estimate tokens and trim if needed
    let totalChars = 0;
    const selected = [];

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      totalChars += msg.content.length;
      if (totalChars > maxTokens * 4) break; // rough token estimate
      selected.unshift(msg);
    }

    return selected;
  }

  clear() {
    this.messages = [];
  }
}

module.exports = ConversationMemory;