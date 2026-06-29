/**
 * Workflow definitions for different task types.
 */
const WORKFLOWS = {
  FIX_ERRORS: {
    name: 'Fix Errors',
    steps: ['analyze_errors', 'fix_code', 'verify_fix'],
  },
  ADD_FEATURE: {
    name: 'Add Feature',
    steps: ['plan_implementation', 'implement_code', 'add_tests', 'verify_build', 'review'],
  },
  REFACTOR: {
    name: 'Refactor',
    steps: ['analyze_structure', 'refactor_code', 'run_tests', 'verify_build', 'review'],
  },
  DEBUG: {
    name: 'Debug',
    steps: ['reproduce_issue', 'find_root_cause', 'fix_issue', 'verify_fix'],
  },
};

module.exports = { WORKFLOWS };