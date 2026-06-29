module.exports = {
  createClient: require('./openrouter').createClient,
  modelRouter: require('./model-router'),
  prompts: {
    supervisor: require('./prompts/supervisor.prompt'),
    coder: require('./prompts/coder.prompt'),
    reviewer: require('./prompts/reviewer.prompt'),
    docs: require('./prompts/docs.prompt'),
  },
};