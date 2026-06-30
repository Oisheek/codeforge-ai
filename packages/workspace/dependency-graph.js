/**
 * Build a dependency graph from imports/requires.
 * For V1, a simplified version that parses JS require/import statements.
 */

const fs = require('fs');
const path = require('path');

class DependencyGraph {
  constructor() {
    this.graph = new Map(); // file → Set of dependencies
  }

  async build(projectPath, files) {
    this.graph.clear();

    for (const file of files) {
      if (!/\.(js|jsx|ts|tsx)$/.test(file)) continue;

      try {
        const fullPath = path.resolve(projectPath, file);
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        const deps = this._parseImports(content, file);
        this.graph.set(file, new Set(deps));
      } catch {}
    }

    return this.graph;
  }

  _parseImports(content, fromFile) {
    const deps = [];

    // Match require('...') and require("...")
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = requireRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    // Match import ... from '...' and import '...'
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(content)) !== null) {
      deps.push(match[1] || match[2]);
    }

    return deps.filter((d) => !d.startsWith('.')); // Only external deps for now
  }

  getDependencies(file) {
    return Array.from(this.graph.get(file) || []);
  }

  getDependents(file) {
    const dependents = [];
    for (const [f, deps] of this.graph) {
      if (deps.has(file)) dependents.push(f);
    }
    return dependents;
  }
}

module.exports = DependencyGraph;