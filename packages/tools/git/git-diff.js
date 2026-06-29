const { execFile } = require('child_process');

function gitDiff(repoPath, options = {}) {
  const args = ['diff'];
  if (options.staged) args.push('--staged');
  if (options.file) args.push('--', options.file);

  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

module.exports = gitDiff;