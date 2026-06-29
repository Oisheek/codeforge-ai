const { execFile } = require('child_process');

async function gitCommit(repoPath, message) {
  await new Promise((resolve, reject) => {
    execFile('git', ['add', '-A'], { cwd: repoPath }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  return new Promise((resolve, reject) => {
    execFile('git', ['commit', '-m', message], { cwd: repoPath }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

module.exports = gitCommit;