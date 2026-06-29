const { AGENT_ROLES } = require('@codeforge/shared/constants');

class DocsAgent {
  constructor(llmClient) {
    this.llmClient = llmClient;
    this.role = AGENT_ROLES.DOCS;
  }

  async generate(task, changesSummary) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/docs.prompt');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole(this.role),
      messages: prompt.buildMessages(task, changesSummary),
    });

    const { parseJSON } = require('@codeforge/shared/utils');
    return parseJSON(response) || { thoughts: response, summary: response, changelog: '', actions: [] };
  }
}

module.exports = DocsAgent;