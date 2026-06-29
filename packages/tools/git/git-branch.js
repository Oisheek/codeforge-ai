const { execFile } = require('child_process');

function gitBranch(repoPath, action, options = {}) {
  let args = ['branch'];

  if (action === 'list') {
    args = ['branch', '-a'];
  } else if (action === 'create') {
    args = ['checkout', '-b', options.name];
  } else if (action === 'switch') {
    args = ['checkout', options.name];
  } else if (action === 'delete') {
    args = ['branch', '-D', options.name];
  }

  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: repoPath }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

module.exports = gitBranch;