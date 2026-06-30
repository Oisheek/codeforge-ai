const { AGENT_ROLES } = require('@codeforge/shared/constants');

class CoderAgent {
  constructor(llmClient) {
    this.llmClient = llmClient;
    this.role = AGENT_ROLES.CODER;
  }

  async implement(step, repoSummary, context, recentFiles) {
    const { modelRouter } = require('../../providers');
    const prompt = require('@codeforge/llm/prompts/coder.prompt');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole(this.role),
      messages: prompt.buildMessages(step, repoSummary, context, recentFiles),
    });

    const { parseJSON } = require('@codeforge/shared/utils');
    return parseJSON(response) || { thoughts: response, actions: [] };
  }
}

module.exports = CoderAgent;