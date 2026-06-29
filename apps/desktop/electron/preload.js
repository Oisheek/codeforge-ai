const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("codeforge", {
  // -----------------------
  // Folder Dialog
  // -----------------------
  openFolder: () => ipcRenderer.invoke("dialog:openFolder"),

  // -----------------------
  // File System
  // -----------------------
  readFile: (path) => ipcRenderer.invoke("fs:readFile", path),

  writeFile: (path, content) =>
    ipcRenderer.invoke("fs:writeFile", path, content),

  createFile: (path, content = "") =>
    ipcRenderer.invoke("fs:createFile", path, content),

  deleteFile: (path) =>
    ipcRenderer.invoke("fs:deleteFile", path),

  listFiles: (dir, options = {}) =>
    ipcRenderer.invoke("fs:listFiles", dir, options),

  // -----------------------
  // Terminal
  // -----------------------
  runCommand: (command, cwd, options = {}) =>
    ipcRenderer.invoke("terminal:runCommand", command, cwd, options),

  spawnTerminal: (cwd) =>
    ipcRenderer.invoke("terminal:spawn", cwd),

  writeTerminal: (pid, data) =>
    ipcRenderer.invoke("terminal:write", pid, data),

  resizeTerminal: (pid, cols, rows) =>
    ipcRenderer.invoke("terminal:resize", pid, cols, rows),

  killTerminal: (pid) =>
    ipcRenderer.invoke("terminal:kill", pid),

  // -----------------------
  // Agent
  // -----------------------
  startAgent: (task, projectPath, options = {}) =>
    ipcRenderer.invoke("agent:start", task, projectPath, options),

  stopAgent: () =>
    ipcRenderer.invoke("agent:stop"),

  // -----------------------
  // App
  // -----------------------
  getVersion: () =>
    ipcRenderer.invoke("app:version"),

  // -----------------------
  // Events
  // -----------------------
  onAgentUpdate: (callback) => {
    ipcRenderer.removeAllListeners("agent:update");
    ipcRenderer.on("agent:update", (_event, data) => callback(data));
  },

  onAgentComplete: (callback) => {
    ipcRenderer.removeAllListeners("agent:complete");
    ipcRenderer.on("agent:complete", (_event, data) => callback(data));
  },

  onTerminalData: (callback) => {
    ipcRenderer.removeAllListeners("terminal:data");
    ipcRenderer.on("terminal:data", (_event, data) => callback(data));
  },

  removeAgentListeners: () => {
    ipcRenderer.removeAllListeners("agent:update");
    ipcRenderer.removeAllListeners("agent:complete");
  },

  removeTerminalListeners: () => {
    ipcRenderer.removeAllListeners("terminal:data");
  },
});