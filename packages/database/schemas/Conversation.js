const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  projectPath: { type: String, required: true },
  task: { type: String, required: true },
  messages: [{
    role: { type: String, required: true },
    content: { type: String, required: true },
    agent: { type: String },
    actions: [mongoose.Schema.Types.Mixed],
    timestamp: { type: Date, default: Date.now },
  }],
  status: { type: String, default: 'running' },
  result: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);