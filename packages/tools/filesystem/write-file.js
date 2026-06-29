const fs = require('fs');
const path = require('path');

/**
 * Write content to a file. Creates parent directories if needed.
 * @param {string} filePath - Absolute path to the file
 * @param {string} content - Content to write
 * @param {object} [options] - Options
 * @param {string} [options.encoding] - File encoding (default: utf-8)
 * @returns {Promise<{path: string, success: boolean, bytesWritten: number}>}
 */
async function writeFile(filePath, content, options = {}) {
  const resolved = path.resolve(filePath);
  const encoding = options.encoding || 'utf-8';

  const dir = path.dirname(resolved);
  await fs.promises.mkdir(dir, { recursive: true });

  await fs.promises.writeFile(resolved, content, encoding);

  const stat = await fs.promises.stat(resolved);

  return {
    path: resolved,
    success: true,
    bytesWritten: stat.size,
  };
}

module.exports = writeFile;