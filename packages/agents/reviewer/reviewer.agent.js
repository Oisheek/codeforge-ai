const { AGENT_ROLES } = require('@codeforge/shared/constants');

class ReviewerAgent {
  constructor(llmClient) {
    this.llmClient = llmClient;
    this.role = AGENT_ROLES.REVIEWER;
  }

  async review(task, repoSummary, changesSummary) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/reviewer.prompt');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole(this.role),
      messages: prompt.buildMessages(task, repoSummary, changesSummary),
    });

    const { parseJSON } = require('@codeforge/shared/utils');
    return parseJSON(response) || { thoughts: response, approved: false, issues: ['Could not parse review'] };
  }
}

module.exports = ReviewerAgent;