/**
 * Code generation utilities.
 * For V1, code generation is handled by the coder prompt.
 */

module.exports = {
  generateFromTemplate: (template, variables) => {
    let code = template;
    for (const [key, value] of Object.entries(variables)) {
      code = code.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return code;
  },
};