/**
 * Manages retry logic for failed tasks.
 */
class RetryManager {
  constructor(maxAttempts = 10) {
    this.maxAttempts = maxAttempts;
    this.attempts = 0;
    this.backoffMs = 1000;
  }

  shouldRetry() {
    return this.attempts < this.maxAttempts;
  }

  incrementAttempt() {
    this.attempts++;
  }

  getDelay() {
    // Exponential backoff, capped at 30 seconds
    const delay = Math.min(this.backoffMs * Math.pow(2, this.attempts - 1), 30000);
    return delay;
  }

  reset() {
    this.attempts = 0;
  }
}

module.exports = RetryManager;