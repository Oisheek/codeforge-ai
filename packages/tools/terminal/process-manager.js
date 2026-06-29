const { spawn } = require('child_process');
const EventEmitter = require('events');

/**
 * Manages long-running processes (for interactive terminals).
 */
class ProcessManager extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.nextPid = 1;
  }

  /**
   * Spawn a new interactive process.
   * @param {string} command - Command to run
   * @param {string} cwd - Working directory
   * @param {object} [options] - Options
   * @returns {{ pid: number, kill: function }}
   */
  spawn(command, cwd, options = {}) {
    const pid = this.nextPid++;
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd.exe' : '/bin/bash';
    const shellArgs = isWindows ? ['/c', command] : ['-c', command];

    const proc = spawn(shell, shellArgs, {
      cwd,
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const record = { pid, proc, stdout: '', stderr: '' };

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      record.stdout += chunk;
      this.emit('data', { pid, stream: 'stdout', data: chunk });
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      record.stderr += chunk;
      this.emit('data', { pid, stream: 'stderr', data: chunk });
    });

    proc.on('close', (exitCode) => {
      this.emit('exit', { pid, exitCode });
      this.processes.delete(pid);
    });

    proc.on('error', (err) => {
      this.emit('error', { pid, error: err.message });
      this.processes.delete(pid);
    });

    this.processes.set(pid, record);

    return {
      pid,
      kill: () => this.kill(pid),
      write: (data) => this.write(pid, data),
      resize: (cols, rows) => this.resize(pid, cols, rows),
    };
  }

  write(pid, data) {
    const record = this.processes.get(pid);
    if (!record) throw new Error(`Process ${pid} not found`);
    record.proc.stdin.write(data);
  }

  resize(pid, cols, rows) {
    // For pty-based processes, this would resize the terminal.
    // For simple spawn, this is a no-op.
  }

  kill(pid) {
    const record = this.processes.get(pid);
    if (!record) return;
    try {
      record.proc.kill('SIGTERM');
      setTimeout(() => {
        try { record.proc.kill('SIGKILL'); } catch {}
      }, 3000);
    } catch {}
    this.processes.delete(pid);
  }

  killAll() {
    for (const [pid] of this.processes) {
      this.kill(pid);
    }
  }

  getRunning() {
    return Array.from(this.processes.keys());
  }
}

// Singleton
const processManager = new ProcessManager();

module.exports = processManager;