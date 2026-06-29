const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out',
  '__pycache__', '.cache', '.turbo', 'coverage', '.vscode',
]);

const IGNORE_FILES = new Set([
  '.DS_Store', 'Thumbs.db', '.env.local',
]);

module.exports = function registerFileIPC({ ipcMain }) {
  // ── Read File ───────────────────────────────────────────
  ipcMain.handle('fs:readFile', async (_event, filePath) => {
    try {
      const resolved = path.resolve(filePath);
      const content = await fs.promises.readFile(resolved, 'utf-8');
      return content;
    } catch (err) {
      throw new Error(`Failed to read file ${filePath}: ${err.message}`);
    }
  });

  // ── Write File ──────────────────────────────────────────
  ipcMain.handle('fs:writeFile', async (_event, filePath, content) => {
    try {
      const resolved = path.resolve(filePath);
      await fs.promises.writeFile(resolved, content, 'utf-8');
      return { success: true, path: resolved };
    } catch (err) {
      throw new Error(`Failed to write file ${filePath}: ${err.message}`);
    }
  });

  // ── Create File ─────────────────────────────────────────
  ipcMain.handle('fs:createFile', async (_event, filePath, content = '') => {
    try {
      const resolved = path.resolve(filePath);
      const dir = path.dirname(resolved);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(resolved, content, 'utf-8');
      return { success: true, path: resolved };
    } catch (err) {
      throw new Error(`Failed to create file ${filePath}: ${err.message}`);
    }
  });

  // ── Delete File ─────────────────────────────────────────
  ipcMain.handle('fs:deleteFile', async (_event, filePath) => {
    try {
      const resolved = path.resolve(filePath);
      await fs.promises.unlink(resolved);
      return { success: true, path: resolved };
    } catch (err) {
      throw new Error(`Failed to delete file ${filePath}: ${err.message}`);
    }
  });

  // ── List Files (tree structure) ─────────────────────────
  ipcMain.handle('fs:listFiles', async (_event, dirPath, options = {}) => {
    const {
      maxDepth = 4,
      ignore = [],
    } = options;

    const allIgnore = new Set([...IGNORE_DIRS, ...ignore]);

    async function walk(currentPath, depth) {
      if (depth > maxDepth) return [];

      const stat = await fs.promises.stat(currentPath);
      const name = path.basename(currentPath);

      if (stat.isFile()) {
        if (IGNORE_FILES.has(name)) return [];
        return [{ name, path: currentPath, type: 'file' }];
      }

      if (stat.isDirectory()) {
        if (allIgnore.has(name) && depth > 0) return [];

        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        const children = [];

        for (const entry of entries) {
          const entryPath = path.join(currentPath, entry.name);
          try {
            const subItems = await walk(entryPath, depth + 1);
            children.push(...subItems);
          } catch {
            // Skip inaccessible files/dirs
          }
        }

        return [{ name, path: currentPath, type: 'directory', children }];
      }

      return [];
    }

    try {
      const resolved = path.resolve(dirPath);
      const tree = await walk(resolved, 0);
      return tree;
    } catch (err) {
      throw new Error(`Failed to list files in ${dirPath}: ${err.message}`);
    }
  });
};