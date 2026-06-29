const fs = require('fs');
const path = require('path');

/**
 * Truncate a string to a maximum length, adding an ellipsis.
 */
function truncate(str, maxLength = 5000) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '\n... [truncated]';
}

/**
 * Build a repo summary (file tree + key files) for agent context.
 * @param {string} projectPath
 * @param {object} [options]
 * @returns {Promise<string>}
 */
async function buildRepoSummary(projectPath, options = {}) {
  const maxFiles = options.maxFiles || 100;
  const maxFileSize = options.maxFileSize || 10000;

  const listFiles = require('../../tools/filesystem/list-files');

  const tree = await listFiles(projectPath, { maxDepth: 3 });
  const allFiles = await listFiles(projectPath, { maxDepth: 3, filesOnly: true });

  // Build tree string
  let treeStr = 'Repository Structure:\n';
  treeStr += formatTree(tree, 0);

  // Read key config files
  const keyFiles = allFiles
    .filter((f) => {
      const name = path.basename(f.path);
      return [
        'package.json', 'tsconfig.json', '.eslintrc.js', '.eslintrc.json',
        'Cargo.toml', 'go.mod', 'requirements.txt', 'pyproject.toml',
        'README.md', 'Makefile', 'Dockerfile', 'docker-compose.yml',
        'next.config.js', 'next.config.mjs', 'vite.config.js', 'webpack.config.js',
      ].includes(name);
    })
    .slice(0, 20);

  let filesContent = '\n\nKey Configuration Files:\n';
  for (const file of keyFiles) {
    try {
      const stat = await fs.promises.stat(file.path);
      if (stat.size > maxFileSize) continue;
      const content = await fs.promises.readFile(file.path, 'utf-8');
      const relativePath = path.relative(projectPath, file.path);
      filesContent += `\n--- ${relativePath} ---\n${content}\n`;
    } catch {}
  }

  return treeStr + filesContent;
}

function formatTree(nodes, depth) {
  let result = '';
  for (const node of nodes) {
    const indent = '  '.repeat(depth);
    if (node.type === 'directory') {
      result += `${indent}📁 ${node.name}/\n`;
      if (node.children) {
        result += formatTree(node.children, depth + 1);
      }
    } else {
      result += `${indent}📄 ${node.name}\n`;
    }
  }
  return result;
}

/**
 * Safely parse JSON from LLM output, handling markdown code blocks.
 */
function parseJSON(text) {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Try extracting from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {}
  }

  // Try finding the first { ... } block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  return null;
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  truncate,
  buildRepoSummary,
  parseJSON,
  sleep,
  formatTree,
};