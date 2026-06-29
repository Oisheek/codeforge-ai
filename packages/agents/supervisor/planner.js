/**
 * The planner breaks down a task into ordered steps.
 * For V1, this logic is embedded in the supervisor prompt.
 * This module can be expanded for more sophisticated planning.
 */

function createPlan(task, repoSummary) {
  // This is handled by the supervisor agent's prompt.
  // Kept as a module for future expansion (e.g., RAG-based planning).
  return { task, steps: [] };
}

module.exports = { createPlan };