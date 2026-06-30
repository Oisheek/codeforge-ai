/**
 * The repair engine handles fixing errors found during build/test.
 * For V1, this is handled by the coder prompt with error context.
 */

class RepairEngine {
  constructor(llmClient) {
    this.llmClient = llmClient;
  }

  async repair(errorOutput, parsedErrors, repoSummary, context) {
    const { modelRouter } = require('../../providers');
    const prompt = require('@codeforge/llm/prompts/coder.prompt');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole('coder'),
      messages: prompt.buildMessages(
        { description: `Fix these errors:\n${errorOutput}`, verifyCommand: '' },
        repoSummary,
        context,
        ''
      ),
    });

    const { parseJSON } = require('@codeforge/shared/utils');
    return parseJSON(response) || { thoughts: response, actions: [] };
  }
}

module.exports = RepairEngine;