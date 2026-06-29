module.exports = {
  // Agent roles
  AGENT_ROLES: {
    SUPERVISOR: 'supervisor',
    CODER: 'coder',
    REVIEWER: 'reviewer',
    DOCS: 'docs',
  },

  // Loop statuses
  LOOP_STATUS: {
    IDLE: 'idle',
    ANALYZING: 'analyzing',
    PLANNING: 'planning',
    CODING: 'coding',
    EXECUTING: 'executing',
    FIXING: 'fixing',
    REVIEWING: 'reviewing',
    DOCUMENTING: 'documenting',
    SUCCESS: 'success',
    FAILED: 'failed',
  },

  // Action types that agents can request
  ACTIONS: {
    READ_FILE: 'read_file',
    WRITE_FILE: 'write_file',
    EDIT_FILE: 'edit_file',
    CREATE_FILE: 'create_file',
    DELETE_FILE: 'delete_file',
    RUN_COMMAND: 'run_command',
    SEARCH_CODE: 'search_code',
    SEARCH_FILES: 'search_files',
    GIT_STATUS: 'git_status',
    GIT_DIFF: 'git_diff',
    THINK: 'think',
  },

  // Model IDs on OpenRouter
  MODELS: {
    SUPERVISOR: 'nvidia/llama-3.1-nemotron-ultra-253b:free',
    CODER: 'qwen/qwen3-coder:free',
    REVIEWER: 'openrouter/gpt-oss-120b:free',
    DOCS: 'google/gemma-4-31b-it:free',
  },

  // Maximum sizes
  MAX_FILE_SIZE: 100 * 1024,        // 100 KB
  MAX_OUTPUT_SIZE: 50 * 1024,        // 50 KB
  MAX_CONTEXT_TOKENS: 32000,
  MAX_ATTEMPTS: 10,
};