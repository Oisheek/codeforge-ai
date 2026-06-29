const os = require('os');
const path = require('path');
const fs = require('fs');

/**
 * Create a temporary sandbox directory for testing changes before applying them.
 * For V1, this is a placeholder. Full sandbox would use Docker or similar.
 */
class Sandbox {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.sandboxPath = path.join(os.tmpdir(), `codeforge-sandbox-${Date.now()}`);
  }

  async create() {
    await fs.promises.mkdir(this.sandboxPath, { recursive: true });
    return this.sandboxPath;
  }

  async cleanup() {
    try {
      await fs.promises.rm(this.sandboxPath, { recursive: true, force: true });
    } catch {}
  }
}

module.exports = Sandbox;