const { execFile } = require('child_process');

function gitLog(repoPath, count = 20) {
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      ['log', `--max-count=${count}`, '--pretty=format:%h %s (%cr) <%an>'],
      { cwd: repoPath, maxBuffer: 5 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout.trim());
      }
    );
  });
}

module.exports = gitLog;