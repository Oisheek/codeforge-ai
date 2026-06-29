const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.codeforge', 'logs');

class Logger {
  constructor(name) {
    this.name = name;
    this.logFile = path.join(LOG_DIR, `${name}.log`);
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  _write(level, message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] [${this.name}] ${message}\n`;
    process.stdout.write(line);
    try {
      fs.appendFileSync(this.logFile, line);
    } catch {}
  }

  info(msg) { this._write('INFO', msg); }
  warn(msg) { this._write('WARN', msg); }
  error(msg) { this._write('ERROR', msg); }
  debug(msg) { this._write('DEBUG', msg); }
}

module.exports = Logger;