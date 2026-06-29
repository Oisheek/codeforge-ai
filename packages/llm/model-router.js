const { MODELS, AGENT_ROLES } = require('@codeforge/shared/constants');

/**
 * Maps agent roles to OpenRouter model IDs.
 * The 4-model setup:
 *   - supervisor → Nemotron 3 Ultra (free)
 *   - coder     → Qwen3-Coder (free)
 *   - reviewer  → GPT-OSS 120B (free)
 *   - docs      → Gemma 4 31B (free)
 */
const ROLE_MODEL_MAP = {
  [AGENT_ROLES.SUPERVISOR]: MODELS.SUPERVISOR,
  [AGENT_ROLES.CODER]: MODELS.CODER,
  [AGENT_ROLES.REVIEWER]: MODELS.REVIEWER,
  [AGENT_ROLES.DOCS]: MODELS.DOCS,
};

/**
 * Get the model ID for a given agent role.
 * @param {string} role - One of AGENT_ROLES values
 * @returns {string} OpenRouter model ID
 */
function getModelForRole(role) {
  const model = ROLE_MODEL_MAP[role];
  if (!model) {
    throw new Error(`Unknown agent role: ${role}. Expected one of: ${Object.values(AGENT_ROLES).join(', ')}`);
  }
  return model;
}

/**
 * Get all model configurations.
 * @returns {object} Map of role → {id, name, description}
 */
function getAllModels() {
  return {
    supervisor: {
      id: MODELS.SUPERVISOR,
      name: 'Nemotron 3 Ultra',
      description: 'High-level orchestration, planning, retry decisions, task decomposition',
    },
    coder: {
      id: MODELS.CODER,
      name: 'Qwen3-Coder',
      description: 'Code generation, refactoring, patching, bug fixing, test generation',
    },
    reviewer: {
      id: MODELS.REVIEWER,
      name: 'GPT-OSS 120B',
      description: 'Code review, security review, architecture review, catching mistakes',
    },
    docs: {
      id: MODELS.DOCS,
      name: 'Gemma 4 31B',
      description: 'README generation, change summaries, documentation, release notes',
    },
  };
}

/**
 * Estimate token count for a string (rough: 1 token ≈ 4 chars).
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

module.exports = {
  getModelForRole,
  getAllModels,
  ROLE_MODEL_MAP,
};