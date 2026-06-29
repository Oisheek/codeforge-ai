const { AGENT_ROLES } = require('@codeforge/shared/constants');

class SupervisorAgent {
  constructor(llmClient) {
    this.llmClient = llmClient;
    this.role = AGENT_ROLES.SUPERVISOR;
  }

  async plan(task, repoSummary, context) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/supervisor.prompt');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole(this.role),
      messages: prompt.buildMessages(task, repoSummary, context),
    });

    const { parseJSON } = require('@codeforge/shared/utils');
    return parseJSON(response) || { thoughts: response, plan: [] };
  }
}

module.exports = SupervisorAgent;