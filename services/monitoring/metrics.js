/**
 * Simple metrics tracker for the agent loop.
 */
class Metrics {
  constructor() {
    this.counters = {};
    this.timers = {};
  }

  increment(name, value = 1) {
    this.counters[name] = (this.counters[name] || 0) + value;
  }

  startTimer(name) {
    this.timers[name] = Date.now();
  }

  endTimer(name) {
    if (this.timers[name]) {
      const duration = Date.now() - this.timers[name];
      this.increment(`${name}_ms`, duration);
      delete this.timers[name];
      return duration;
    }
    return 0;
  }

  getMetrics() {
    return { ...this.counters };
  }
}

module.exports = Metrics;