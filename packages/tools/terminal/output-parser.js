/**
 * Parse build/test errors from command output.
 * Extracts structured error information from compiler, linter, and test output.
 */

// Common error patterns
const ERROR_PATTERNS = [
  // TypeScript compiler errors
  {
    regex: /^(.+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/gm,
    extract: (match) => ({
      file: match[1],
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      code: `TS${match[4]}`,
      message: match[5],
      type: 'typescript',
    }),
  },
  // ESLint errors
  {
    regex: /^\s+(.+):(\d+):(\d+)\s+error\s+(.+)\s+(.+)$/gm,
    extract: (match) => ({
      file: match[1],
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      code: match[5].trim(),
      message: match[4].trim(),
      type: 'eslint',
    }),
  },
  // Generic compiler error: file:line:column: error: message
  {
    regex: /^(.+):(\d+):(\d+):\s+error:\s+(.+)$/gm,
    extract: (match) => ({
      file: match[1],
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      message: match[4],
      type: 'compiler',
    }),
  },
  // Generic error: file:line: error: message
  {
    regex: /^(.+):(\d+):\s+error:\s+(.+)$/gm,
    extract: (match) => ({
      file: match[1],
      line: parseInt(match[2], 10),
      message: match[3],
      type: 'compiler',
    }),
  },
  // Python tracebacks
  {
    regex: /^File\s+"(.+)",\s+line\s+(\d+).*$/gm,
    extract: (match) => ({
      file: match[1],
      line: parseInt(match[2], 10),
      type: 'python',
    }),
  },
  // Test failures (Jest/Mocha style)
  {
    regex: /^\s+✕\s+(.+)\s+\(\d+\s*ms?\)$/gm,
    extract: (match) => ({
      test: match[1],
      message: `Test failed: ${match[1]}`,
      type: 'test',
    }),
  },
  // FAIL test path
  {
    regex: /^\s*FAIL\s+(.+)$/gm,
    extract: (match) => ({
      file: match[1],
      message: `Test suite failed: ${match[1]}`,
      type: 'test',
    }),
  },
];

/**
 * Parse errors from command output.
 * @param {string} output - Combined stdout/stderr output
 * @returns {Array<{file?: string, line?: number, column?: number, message: string, code?: string, type: string}>}
 */
function parseErrors(output) {
  if (!output) return [];

  const errors = [];
  const seen = new Set();

  for (const pattern of ERROR_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(output)) !== null) {
      const error = pattern.extract(match);
      const key = `${error.file || ''}:${error.line || ''}:${error.message || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        errors.push(error);
      }
    }
  }

  // If no structured errors found but exit code was non-zero,
  // look for generic "Error:" lines
  if (errors.length === 0) {
    const errorLines = output.split('\n').filter(
      (line) => /\berror\b/i.test(line) && line.trim().length > 0
    );
    for (const line of errorLines.slice(0, 10)) {
      errors.push({
        message: line.trim(),
        type: 'generic',
      });
    }
  }

  return errors;
}

/**
 * Detect what kind of project this is based on its files.
 * @param {string[]} files - List of file paths in the project
 * @returns {{ type: string, buildCmd: string, testCmd: string, lintCmd: string }}
 */
function detectProjectType(files) {
  const fileSet = new Set(files.map((f) => f.replace(/\\/g, '/').split('/').pop()));

  if (fileSet.has('package.json')) {
    return {
      type: 'node',
      buildCmd: 'npm run build',
      testCmd: 'npm test',
      lintCmd: 'npx eslint .',
    };
  }

  if (fileSet.has('requirements.txt') || fileSet.has('pyproject.toml') || fileSet.has('setup.py')) {
    return {
      type: 'python',
      buildCmd: 'pip install -e .',
      testCmd: 'pytest',
      lintCmd: 'flake8 .',
    };
  }

  if (fileSet.has('Cargo.toml')) {
    return {
      type: 'rust',
      buildCmd: 'cargo build',
      testCmd: 'cargo test',
      lintCmd: 'cargo clippy',
    };
  }

  if (fileSet.has('go.mod')) {
    return {
      type: 'go',
      buildCmd: 'go build ./...',
      testCmd: 'go test ./...',
      lintCmd: '',
    };
  }

  return {
    type: 'unknown',
    buildCmd: '',
    testCmd: '',
    lintCmd: '',
  };
}

module.exports = { parseErrors, detectProjectType };