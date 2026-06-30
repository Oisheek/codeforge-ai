const fs = require('fs');
const path = require('path');
const { getIgnoredPaths } = require('@codeforge/shared/config');

class RepositoryIndexer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.index = new Map();
  }

  async index() {
    this.index.clear();
    await this._walk(this.projectPath, 0);
    return this.getIndex();
  }

  async _walk(dir, depth) {
    if (depth > 8) return;
    const ignored = new Set(getIgnoredPaths());

    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch { return; }

    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(this.projectPath, fullPath);

      if (entry.isDirectory()) {
        await this._walk(fullPath, depth + 1);
      } else {
        try {
          const stat = await fs.promises.stat(fullPath);
          this.index.set(relPath, {
            path: relPath,
            size: stat.size,
            modified: stat.mtime,
            ext: path.extname(entry.name).slice(1),
          });
        } catch {}
      }
    }
  }

  getIndex() {
    return Object.fromEntries(this.index);
  }

  search(query) {
    const results = [];
    for (const [filePath, meta] of this.index) {
      if (filePath.toLowerCase().includes(query.toLowerCase())) {
        results.push({ ...meta });
      }
    }
    return results;
  }
}

module.exports = RepositoryIndexer;