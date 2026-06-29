const { execFile } = require('child_process');

function gitStatus(repoPath) {
  return new Promise((resolve, reject) => {
    execFile('git', ['status', '--porcelain=v2'], { cwd: repoPath, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

module.exports = gitStatus;