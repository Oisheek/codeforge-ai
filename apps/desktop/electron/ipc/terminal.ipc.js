const runCommand = require('../../../../packages/tools/terminal/run-command');
const processManager = require('../../../../packages/tools/terminal/process-manager');
const path = require('path');

module.exports = function registerTerminalIPC({ ipcMain, mainWindow }) {
  // ── Run Command (one-shot) ──────────────────────────────
  ipcMain.handle('terminal:runCommand', async (_event, command, cwd, options = {}) => {
    const resolvedCwd = path.resolve(cwd);
    try {
      const result = await runCommand(command, resolvedCwd, {
        timeout: options.timeout || 120000,
        env: options.env,
      });
      return result;
    } catch (err) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: err.message,
        duration: 0,
        timedOut: false,
        errors: [err.message],
      };
    }
  });

  // ── Spawn Long-Running Process ─────────────────────────
  ipcMain.handle('terminal:spawn', async (_event, cwd) => {
    const resolvedCwd = path.resolve(cwd);
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd.exe' : process.env.SHELL || '/bin/bash';
    const handle = processManager.spawn(shell, resolvedCwd);
    return { pid: handle.pid };
  });

  // ── Write to Process stdin ──────────────────────────────
  ipcMain.handle('terminal:write', async (_event, pid, data) => {
    processManager.write(pid, data);
    return { success: true };
  });

  // ── Resize Terminal ─────────────────────────────────────
  ipcMain.handle('terminal:resize', async (_event, pid, cols, rows) => {
    processManager.resize(pid, cols, rows);
    return { success: true };
  });

  // ── Kill Process ────────────────────────────────────────
  ipcMain.handle('terminal:kill', async (_event, pid) => {
    processManager.kill(pid);
    return { success: true };
  });

  // ── Forward process output to renderer ──────────────────
  processManager.on('data', ({ pid, stream, data }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal:data', { pid, stream, data });
    }
  });

  processManager.on('exit', ({ pid, exitCode }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal:data', { pid, stream: 'exit', data: `\n[Process exited with code ${exitCode}]\n` });
    }
  });
};