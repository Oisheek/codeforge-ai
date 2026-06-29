module.exports = {
  filesystem: {
    readFile: require('./filesystem/read-file'),
    writeFile: require('./filesystem/write-file'),
    createFile: require('./filesystem/create-file'),
    deleteFile: require('./filesystem/delete-file'),
    listFiles: require('./filesystem/list-files'),
  },
  terminal: {
    runCommand: require('./terminal/run-command'),
    processManager: require('./terminal/process-manager'),
    outputParser: require('./terminal/output-parser'),
  },
  git: {
    gitStatus: require('./git/git-status'),
    gitDiff: require('./git/git-diff'),
    gitCommit: require('./git/git-commit'),
    gitLog: require('./git/git-log'),
    gitBranch: require('./git/git-branch'),
  },
  search: {
    codeSearch: require('./search/code-search'),
    fileSearch: require('./search/file-search'),
    dependencySearch: require('./search/dependency-search'),
  },
};