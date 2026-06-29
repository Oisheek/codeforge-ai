const fs = require('fs');
const path = require('path');
const os = require('os');

const MEMORY_DIR = path.join(os.homedir(), '.codeforge', 'memory');

class ProjectMemory {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.projectHash = projectPath.replace(/[/\\:]/g, '_');
    this.memoryFile = path.join(MEMORY_DIR, `${this.projectHash}.json`);
    this.data = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const content = fs.readFileSync(this.memoryFile, 'utf-8');
        this.data = JSON.parse(content);
      }
    } catch {
      this.data = {};
    }
  }

  save() {
    try {
      if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
      }
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {}
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  getProjectInfo() {
    return this.data.projectInfo || {};
  }

  setProjectInfo(info) {
    this.data.projectInfo = { ...this.getProjectInfo(), ...info };
    this.save();
  }

  addTaskHistory(task) {
    if (!this.data.taskHistory) this.data.taskHistory = [];
    this.data.taskHistory.push({ ...task, timestamp: Date.now() });
    if (this.data.taskHistory.length > 50) {
      this.data.taskHistory = this.data.taskHistory.slice(-50);
    }
    this.save();
  }

  getTaskHistory() {
    return this.data.taskHistory || [];
  }
}

module.exports = ProjectMemory;