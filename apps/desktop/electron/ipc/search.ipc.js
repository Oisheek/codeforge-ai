const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = function registerSearchIPC({ ipcMain }) {
  // ── Code Search (uses grep / findstr) ───────────────────
  ipcMain.handle('search:code', async (_event, repoPath, query, options = {}) => {
    const isWindows = process.platform === 'win32';
    const maxResults = options.maxResults || 50;

    if (isWindows) {
      // Use findstr on Windows
      return new Promise((resolve) => {
        execFile(
          'findstr',
          ['/S', '/N', '/I', query, '*.*'],
          { cwd: path.resolve(repoPath), maxBuffer: 10 * 1024 * 1024 },
          (err, stdout) => {
            if (err) return resolve([]);
            const lines = stdout.trim().split('\n').slice(0, maxResults);
            const results = lines.map((line) => {
              const match = line.match(/^(.+):(\d+):(.*)$/);
              if (match) {
                return { file: match[1], line: parseInt(match[2], 10), content: match[3].trim() };
              }
              return { file: '', line: 0, content: line.trim() };
            });
            resolve(results);
          }
        );
      });
    }

    // Use grep on Unix
    return new Promise((resolve) => {
      execFile(
        'grep',
        ['-rn', '--include=*.{js,jsx,ts,tsx,py,rb,go,rs,java,json,yaml,yml,md,html,css,scss}',
          '-I', query, '.'],
        { cwd: path.resolve(repoPath), maxBuffer: 10 * 1024 * 1024 },
        (err, stdout) => {
          if (err) return resolve([]);
          const lines = stdout.trim().split('\n').slice(0, maxResults);
          const results = lines.map((line) => {
            const match = line.match(/^(.+):(\d+):(.*)$/);
            if (match) {
              return { file: match[1], line: parseInt(match[2], 10), content: match[3].trim() };
            }
            return { file: '', line: 0, content: line.trim() };
          });
          resolve(results);
        }
      );
    });
  });

  // ── File Search ─────────────────────────────────────────
  ipcMain.handle('search:files', async (_event, repoPath, pattern) => {
    const resolved = path.resolve(repoPath);
    const results = [];

    async function walk(dir, depth) {
      if (depth > 10) return;
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
        if (results.length >= 100) return;
      }
    }

    await walk(resolved, 0);
    return results;
  });

  // ── Dependency Search ───────────────────────────────────
  ipcMain.handle('search:dependencies', async (_event, repoPath) => {
    const packageJsonPath = path.resolve(repoPath, 'package.json');
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
  });
};