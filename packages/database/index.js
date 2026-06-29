module.exports = {
  connect: require('./mongodb').connect,
  models: {
    Project: require('./schemas/Project'),
    Conversation: require('./schemas/Conversation'),
    Memory: require('./schemas/Memory'),
    Index: require('./schemas/Index'),
  },
};