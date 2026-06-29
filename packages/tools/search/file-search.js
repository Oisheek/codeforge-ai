const fs = require('fs');
const path = require('path');

async function fileSearch(repoPath, pattern) {
  const results = [];

  async function walk(dir, depth) {
    if (depth > 10 || results.length >= 100) return;
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch { return; }

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
        results.push({ path: fullPath, name: entry.name });
      }
    }
  }

  await walk(repoPath, 0);
  return results;
}

module.exports = fileSearch;