/**
 * Telemetry stub for V1.
 * In production, this would send anonymized usage data.
 * For now, it just logs locally.
 */
class Telemetry {
  track(event, data = {}) {
    // V1: No remote telemetry. Log locally only.
    if (process.env.CODEFORGE_DEBUG) {
      console.log(`[telemetry] ${event}`, data);
    }
  }
}

module.exports = Telemetry;