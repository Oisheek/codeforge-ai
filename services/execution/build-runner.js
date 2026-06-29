const runCommand = require('@codeforge/tools/terminal/run-command');
const outputParser = require('@codeforge/tools/terminal/output-parser');

class BuildRunner {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  async detectAndRun() {
    // Detect the project type and run the appropriate build command
    const fs = require('fs');
    const path = require('path');

    const files = await fs.promises.readdir(this.projectPath);
    const { buildCmd } = outputParser.detectProjectType(files);

    if (!buildCmd) {
      return { success: true, output: 'No build system detected. Skipping build.' };
    }

    return await this.run(buildCmd);
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

module.exports = BuildRunner;