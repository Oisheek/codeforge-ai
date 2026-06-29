const runCommand = require('@codeforge/tools/terminal/run-command');
const outputParser = require('@codeforge/tools/terminal/output-parser');

class TestRunner {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  async detectAndRun() {
    const fs = require('fs');
    const files = await fs.promises.readdir(this.projectPath);
    const { testCmd } = outputParser.detectProjectType(files);

    if (!testCmd) {
      return { success: true, output: 'No test system detected. Skipping tests.' };
    }

    return await this.run(testCmd);
  }

  async run(command) {
    const result = await runCommand(command, this.projectPath, { timeout: 300000 });
    return {
      success: result.exitCode === 0,
      output: result.stdout + (result.stderr ? '\n' + result.stderr : ''),
      errors: result.errors,
      timedOut: result.timedOut,
    };
  }
}

module.exports = TestRunner;