const path = require('path');

// We will implement these packages in steps 6 and 7.
// For now, the agent IPC provides the bridge; the actual
// agent loop will be wired in once the packages are ready.

let currentLoop = null;

module.exports = function registerAgentIPC({ ipcMain, mainWindow }) {
  ipcMain.handle('agent:start', async (_event, task, projectPath, options = {}) => {
    const resolvedPath = path.resolve(projectPath);

    // Lazy-load to avoid circular deps at startup
        const { createDebuggingLoop } = require('../../../../services/orchestrator/debugging-loop');
    const openrouter = require('../../../../packages/llm/openrouter');
    const tools = require('../../../../packages/tools');

    const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || '';

    currentLoop = createDebuggingLoop({
      projectPath: resolvedPath,
      llmClient: openrouter.createClient({ apiKey }),
      tools,
      maxAttempts: options.maxAttempts || 10,
    });

    // Wire up event forwarding to the renderer
    currentLoop.on('update', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('agent:update', data);
      }
    });

    currentLoop.on('complete', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('agent:complete', data);
      }
      currentLoop = null;
    });

    currentLoop.on('error', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('agent:update', {
          type: 'error',
          message: data.message,
        });
      }
    });

    // Run the loop asynchronously (don't await it here)
    currentLoop.run(task).catch((err) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('agent:update', {
          type: 'error',
          message: err.message,
        });
        mainWindow.webContents.send('agent:complete', {
          success: false,
          reason: err.message,
        });
      }
      currentLoop = null;
    });

    return { started: true };
  });

  ipcMain.handle('agent:stop', async () => {
    if (currentLoop) {
      currentLoop.abort();
      currentLoop = null;
    }
    return { stopped: true };
  });

  // App version
  ipcMain.handle('app:version', async () => {
    const { app } = require('electron');
    return app.getVersion();
  });
};