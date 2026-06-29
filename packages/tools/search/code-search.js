const { execFile } = require('child_process');

function codeSearch(repoPath, query, maxResults = 50) {
  const isWindows = process.platform === 'win32';

  return new Promise((resolve) => {
    if (isWindows) {
      execFile('findstr', ['/S', '/N', '/I', query, '*.*'], { cwd: repoPath, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
        if (err) return resolve([]);
        resolve(stdout.trim().split('\n').slice(0, maxResults));
      });
    } else {
      execFile('grep', ['-rn', '-I', query, '.'], { cwd: repoPath, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
        if (err) return resolve([]);
        resolve(stdout.trim().split('\n').slice(0, maxResults));
      });
    }
  });
}

module.exports = codeSearch;