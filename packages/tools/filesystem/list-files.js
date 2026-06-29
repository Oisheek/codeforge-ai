const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out',
  '__pycache__', '.cache', '.turbo', 'coverage', '.vscode',
  '.idea', '.gradle', 'target', 'vendor', 'Pods',
]);

/**
 * List files in a directory as a tree structure.
 * @param {string} dirPath - Absolute path to the directory
 * @param {object} [options] - Options
 * @param {number} [options.maxDepth=4] - Maximum depth to traverse
 * @param {string[]} [options.ignore] - Directory names to ignore
 * @param {boolean} [options.filesOnly=false] - Only return files (no directories)
 * @param {string[]} [options.extensions] - Only include files with these extensions
 * @returns {Promise<Array<{name: string, path: string, type: string, children?: Array}>>}
 */
async function listFiles(dirPath, options = {}) {
  const {
    maxDepth = 4,
    ignore = [],
    filesOnly = false,
    extensions = null,
  } = options;

  const allIgnore = new Set([...DEFAULT_IGNORE, ...ignore]);

  async function walk(currentPath, depth) {
    if (depth > maxDepth) return [];

    let stat;
    try {
      stat = await fs.promises.stat(currentPath);
    } catch {
      return [];
    }

    const name = path.basename(currentPath);

    if (stat.isFile()) {
      const ext = path.extname(name).slice(1).toLowerCase();
      if (extensions && !extensions.includes(ext)) return [];
      return [{ name, path: currentPath, type: 'file' }];
    }

    if (stat.isDirectory()) {
      if (allIgnore.has(name) && depth > 0) return [];

      let entries;
      try {
        entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
      } catch {
        return [];
      }

      // Sort: directories first, then alphabetically
      entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      const children = [];
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        const subItems = await walk(entryPath, depth + 1);
        children.push(...subItems);
      }

      if (filesOnly) return children;

      return [{ name, path: currentPath, type: 'directory', children }];
    }

    return [];
  }

  const resolved = path.resolve(dirPath);
  return walk(resolved, 0);
}

/**
 * List all files as a flat array of paths.
 * @param {string} dirPath - Absolute path
 * @param {object} [options] - Same as listFiles options
 * @returns {Promise<string[]>}
 */
async function listFilesFlat(dirPath, options = {}) {
  const tree = await listFiles(dirPath, { ...options, filesOnly: true });
  return tree.map((f) => f.path);
}

module.exports = listFiles;
module.exports.listFilesFlat = listFilesFlat;