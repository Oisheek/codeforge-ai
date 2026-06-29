const fs = require('fs');
const path = require('path');

/**
 * Read a file's contents.
 * @param {string} filePath - Absolute path to the file
 * @param {object} [options] - Options
 * @param {number} [options.startLine] - Start line (1-based, inclusive)
 * @param {number} [options.endLine] - End line (1-based, inclusive)
 * @param {string} [options.encoding] - File encoding (default: utf-8)
 * @returns {Promise<{path: string, content: string, lines: number, language: string}>}
 */
async function readFile(filePath, options = {}) {
  const resolved = path.resolve(filePath);
  const encoding = options.encoding || 'utf-8';

  const content = await fs.promises.readFile(resolved, encoding);
  const lines = content.split('\n');

  let selectedContent = content;
  let selectedLines = lines.length;

  if (options.startLine || options.endLine) {
    const start = (options.startLine || 1) - 1;
    const end = options.endLine || lines.length;
    selectedContent = lines.slice(start, end).join('\n');
    selectedLines = end - start;
  }

  const ext = path.extname(resolved).slice(1).toLowerCase();
  const languageMap = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    html: 'html', css: 'css', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sql: 'sql', sh: 'shell',
  };

  return {
    path: resolved,
    content: selectedContent,
    lines: selectedLines,
    language: languageMap[ext] || 'plaintext',
  };
}

module.exports = readFile;