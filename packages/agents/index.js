// Agent modules will be expanded beyond what the orchestrator already handles.
// For V1, the WorkflowEngine in services/orchestrator directly calls the LLM
// with agent-specific prompts. These modules can be extracted later.

module.exports = {
  supervisor: require('./supervisor/supervisor.agent'),
  coder: require('./coder/coder.agent'),
  reviewer: require('./reviewer/reviewer.agent'),
  docs: require('./docs/docs.agent'),
};