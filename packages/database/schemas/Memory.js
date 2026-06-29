const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  projectPath: { type: String, required: true },
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  category: { type: String, default: 'general' },
}, { timestamps: true });

MemorySchema.index({ projectPath: 1, key: 1 }, { unique: true });

module.exports = mongoose.models.Memory || mongoose.model('Memory', MemorySchema);