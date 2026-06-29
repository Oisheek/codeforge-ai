const fs = require('fs');
const path = require('path');

/**
 * Create a new file. Fails if the file already exists (unless overwrite is true).
 * @param {string} filePath - Absolute path to the file
 * @param {string} [content=''] - Initial content
 * @param {object} [options] - Options
 * @param {boolean} [options.overwrite=false] - Overwrite if file exists
 * @returns {Promise<{path: string, success: boolean, created: boolean}>}
 */
async function createFile(filePath, content = '', options = {}) {
  const resolved = path.resolve(filePath);

  const exists = fs.existsSync(resolved);
  if (exists && !options.overwrite) {
    throw new Error(`File already exists: ${resolved}. Use overwrite: true to replace.`);
  }

  const dir = path.dirname(resolved);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(resolved, content, 'utf-8');

  return {
    path: resolved,
    success: true,
    created: !exists,
  };
}

module.exports = createFile;