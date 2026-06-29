const fs = require('fs');
const path = require('path');

async function dependencySearch(repoPath) {
  const packageJsonPath = path.join(repoPath, 'package.json');
  try {
    const content = await fs.promises.readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    return {
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
    };
  } catch {
    return { dependencies: [], devDependencies: [] };
  }
}

module.exports = dependencySearch;