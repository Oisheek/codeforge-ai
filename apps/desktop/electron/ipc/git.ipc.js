const { execFile } = require('child_process');
const path = require('path');

function git(repoPath, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      args,
      { cwd: path.resolve(repoPath), maxBuffer: 10 * 1024 * 1024, ...options },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}

module.exports = function registerGitIPC({ ipcMain }) {
  ipcMain.handle('git:status', async (_event, repoPath) => {
    const output = await git(repoPath, ['status', '--porcelain=v2']);
    return output;
  });

  ipcMain.handle('git:diff', async (_event, repoPath, options = {}) => {
    const args = ['diff'];
    if (options.staged) args.push('--staged');
    if (options.file) args.push('--', options.file);
    const output = await git(repoPath, args);
    return output;
  });

  ipcMain.handle('git:commit', async (_event, repoPath, message) => {
    await git(repoPath, ['add', '-A']);
    const output = await git(repoPath, ['commit', '-m', message]);
    return output;
  });

  ipcMain.handle('git:log', async (_event, repoPath, options = {}) => {
    const count = options.count || 20;
    const format = options.format || '%h %s (%cr) <%an>';
    const output = await git(repoPath, ['log', `--max-count=${count}`, `--pretty=format:${format}`]);
    return output;
  });

  ipcMain.handle('git:branch', async (_event, repoPath, action, options = {}) => {
    if (action === 'list') {
      const output = await git(repoPath, ['branch', '-a']);
      return output;
    }
    if (action === 'create') {
      const output = await git(repoPath, ['checkout', '-b', options.name]);
      return output;
    }
    if (action === 'switch') {
      const output = await git(repoPath, ['checkout', options.name]);
      return output;
    }
    throw new Error(`Unknown git branch action: ${action}`);
  });
};