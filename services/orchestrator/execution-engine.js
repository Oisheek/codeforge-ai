const path = require('path');
const fs = require('fs');
const { ACTIONS } = require('@codeforge/shared/constants');
const { truncate } = require('@codeforge/shared/utils');

/**
 * Executes actions requested by agents (file ops, terminal commands, etc.).
 */
class ExecutionEngine {
  constructor({ projectPath, tools }) {
    this.projectPath = projectPath;
    this.tools = tools;
  }

  /**
   * Execute a single action.
   * @param {object} action - The action to execute
   * @returns {Promise<{success: boolean, output: string, data?: any}>}
   */
  async execute(action) {
    const resolvedPath = action.path
      ? path.resolve(this.projectPath, action.path)
      : null;

    // Safety: ensure path is within project
    if (resolvedPath && !resolvedPath.startsWith(path.resolve(this.projectPath))) {
      return {
        success: false,
        output: `Error: Path "${action.path}" is outside the project directory.`,
      };
    }

    try {
      switch (action.type) {
        case ACTIONS.READ_FILE:
          return await this._readFile(resolvedPath);

        case ACTIONS.WRITE_FILE:
          return await this._writeFile(resolvedPath, action.content);

        case ACTIONS.EDIT_FILE:
          return await this._editFile(resolvedPath, action.search, action.replace);

        case ACTIONS.CREATE_FILE:
          return await this._createFile(resolvedPath, action.content);

        case ACTIONS.DELETE_FILE:
          return await this._deleteFile(resolvedPath);

        case ACTIONS.RUN_COMMAND:
          return await this._runCommand(action.command);

        case ACTIONS.SEARCH_CODE:
          return await this._searchCode(action.query);

        case ACTIONS.SEARCH_FILES:
          return await this._searchFiles(action.pattern);

        case ACTIONS.GIT_STATUS:
          return await this._gitStatus();

        case ACTIONS.GIT_DIFF:
          return await this._gitDiff(action.file);

        case ACTIONS.THINK:
          return { success: true, output: action.thought || '(thinking)' };

        default:
          return { success: false, output: `Unknown action type: ${action.type}` };
      }
    } catch (err) {
      return { success: false, output: `Error executing ${action.type}: ${err.message}` };
    }
  }

  async _readFile(filePath) {
    const result = await this.tools.filesystem.readFile(filePath);
    return {
      success: true,
      output: `File: ${path.relative(this.projectPath, filePath)} (${result.lines} lines)\n${truncate(result.content)}`,
      data: result,
    };
  }

  async _writeFile(filePath, content) {
    const result = await this.tools.filesystem.writeFile(filePath, content || '');
    return {
      success: true,
      output: `Wrote ${result.bytesWritten} bytes to ${path.relative(this.projectPath, filePath)}`,
    };
  }

  async _editFile(filePath, search, replace) {
    const { content } = await this.tools.filesystem.readFile(filePath);
    if (!content.includes(search)) {
      return {
        success: false,
        output: `Could not find the search string in ${path.relative(this.projectPath, filePath)}. The file may have already been modified.`,
      };
    }
    const newContent = content.replace(search, replace);
    await this.tools.filesystem.writeFile(filePath, newContent);
    return {
      success: true,
      output: `Edited ${path.relative(this.projectPath, filePath)}: replaced ${search.length} chars with ${replace.length} chars`,
    };
  }

  async _createFile(filePath, content) {
    const result = await this.tools.filesystem.createFile(filePath, content || '', { overwrite: true });
    return {
      success: true,
      output: `Created ${path.relative(this.projectPath, filePath)}`,
    };
  }

  async _deleteFile(filePath) {
    await this.tools.filesystem.deleteFile(filePath);
    return {
      success: true,
      output: `Deleted ${path.relative(this.projectPath, filePath)}`,
    };
  }

  async _runCommand(command) {
    const result = await this.tools.terminal.runCommand(command, this.projectPath, { timeout: 120000 });
    const output = [];
    if (result.stdout) output.push(truncate(result.stdout, 8000));
    if (result.stderr) output.push('STDERR:\n' + truncate(result.stderr, 4000));
    if (result.timedOut) output.push('[Command timed out]');

    return {
      success: result.exitCode === 0,
      output: output.join('\n'),
      data: {
        exitCode: result.exitCode,
        errors: result.errors,
        timedOut: result.timedOut,
      },
    };
  }

  async _searchCode(query) {
    const results = await new Promise((resolve) => {
      // Use the search code via child_process directly
      const { execFile } = require('child_process');
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        execFile('findstr', ['/S', '/N', '/I', query, '*.*'], { cwd: this.projectPath, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
          resolve(err ? [] : stdout.trim().split('\n').slice(0, 30));
        });
      } else {
        execFile('grep', ['-rn', '-I', query, '.'], { cwd: this.projectPath, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
          resolve(err ? [] : stdout.trim().split('\n').slice(0, 30));
        });
      }
    });

    return {
      success: true,
      output: `Search results for "${query}":\n${truncate(results.join('\n'), 5000)}`,
    };
  }

  async _searchFiles(pattern) {
    const result = await this.tools.filesystem.listFilesFlat(this.projectPath);
    const matches = result.filter((f) => f.toLowerCase().includes(pattern.toLowerCase())).slice(0, 30);
    return {
      success: true,
      output: `Files matching "${pattern}":\n${matches.map((f) => path.relative(this.projectPath, f)).join('\n')}`,
    };
  }

  async _gitStatus() {
    const { execFile } = require('child_process');
    return new Promise((resolve) => {
      execFile('git', ['status', '--porcelain'], { cwd: this.projectPath }, (err, stdout) => {
        if (err) {
          resolve({ success: false, output: `Git error: ${err.message}` });
        } else {
          resolve({ success: true, output: truncate(stdout, 5000) || 'Working tree clean' });
        }
      });
    });
  }

  async _gitDiff(file) {
    const { execFile } = require('child_process');
    const args = ['diff'];
    if (file) args.push('--', file);
    return new Promise((resolve) => {
      execFile('git', args, { cwd: this.projectPath }, (err, stdout) => {
        if (err) {
          resolve({ success: false, output: `Git error: ${err.message}` });
        } else {
          resolve({ success: true, output: truncate(stdout, 10000) || 'No changes' });
        }
      });
    });
  }
}

module.exports = ExecutionEngine;