const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ── Globals ──────────────────────────────────────────────
let mainWindow = null;
const isDev = !app.isPackaged;

// ── Window Creation ──────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'CodeForge AI',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, serve the static export from out/
    const express = require('express');
    const server = express();
    const outDir = path.join(__dirname, '..', 'out');
    server.use(express.static(outDir));
    // SPA fallback: serve index.html for any unmatched route
    server.get('*', (req, res) => {
      res.sendFile(path.join(outDir, 'index.html'));
    });
    // Find a free port
    const http = require('http');
    const srv = http.createServer(server);
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      mainWindow.loadURL(`http://127.0.0.1:${port}`);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── App Lifecycle ────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ── IPC: Folder Dialog ───────────────────────────────────
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Open Project Folder',
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// ── Load modular IPC handlers ────────────────────────────
const ipcDir = path.join(__dirname, 'ipc');
if (fs.existsSync(ipcDir)) {
  const ipcFiles = fs.readdirSync(ipcDir).filter((f) => f.endsWith('.js'));
  for (const file of ipcFiles) {
    try {
      const register = require(path.join(ipcDir, file));
      if (typeof register === 'function') {
        register({ ipcMain, mainWindow });
      }
    } catch (err) {
      console.error(`Failed to load IPC handler ${file}:`, err);
    }
  }
}