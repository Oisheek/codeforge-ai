const path = require('path');

module.exports = {
  getOpenRouterConfig: () => ({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
      'HTTP-Referer': 'https://codeforge-ai.dev',
      'X-Title': 'CodeForge AI',
    },
  }),

  getMongoConfig: () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforge',
    dbName: 'codeforge',
  }),

  getIgnoredPaths: () => [
    'node_modules', '.git', '.next', 'dist', 'build', 'out',
    '__pycache__', '.cache', '.turbo', 'coverage', '.vscode',
    '.idea', '.gradle', 'target', 'vendor', 'Pods', '.env.local',
  ],

  getIgnoredFiles: () => [
    '.DS_Store', 'Thumbs.db', 'package-lock.json', 'yarn.lock',
    'pnpm-lock.yaml', '.pnp.js', '.pnp.cjs',
  ],
};