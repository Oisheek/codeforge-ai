const { spawn } = require('child_process');
const outputParser = require('./output-parser');

/**
 * Run a terminal command and capture its output.
 * @param {string} command - Command to run
 * @param {string} cwd - Working directory
 * @param {object} [options] - Options
 * @param {number} [options.timeout=120000] - Timeout in ms
 * @param {object} [options.env] - Environment variables
 * @param {function} [options.onStdout] - Callback for stdout chunks
 * @param {function} [options.onStderr] - Callback for stderr chunks
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string, duration: number, timedOut: boolean, errors: string[]}>}
 */
function runCommand(command, cwd, options = {}) {
  return new Promise((resolve) => {
    const timeout = options.timeout || 120000;
    const startTime = Date.now();

    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd.exe' : '/bin/bash';
    const shellArgs = isWindows ? ['/c', command] : ['-c', command];

    const env = { ...process.env, ...options.env, FORCE_COLOR: '0', NO_COLOR: '1' };

    const proc = spawn(shell, shellArgs, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      // On Windows, don't use shell: true since we're already using cmd.exe
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      if (options.onStdout) options.onStdout(chunk);
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      if (options.onStderr) options.onStderr(chunk);
    });

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
      // Force kill after 5 seconds
      setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch {}
      }, 5000);
    }, timeout);

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      const errors = outputParser.parseErrors(stderr || stdout);

      resolve({
        exitCode: exitCode || 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        duration,
        timedOut,
        errors,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      resolve({
        exitCode: 1,
        stdout: stdout.trim(),
        stderr: err.message,
        duration,
        timedOut: false,
        errors: [err.message],
      });
    });
  });
}

module.exports = runCommand;