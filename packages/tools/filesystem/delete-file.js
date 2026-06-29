const fs = require('fs');
const path = require('path');

/**
 * Delete a file.
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<{path: string, success: boolean}>}
 */
async function deleteFile(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  await fs.promises.unlink(resolved);

  return {
    path: resolved,
    success: true,
  };
}

module.exports = deleteFile;