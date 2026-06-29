const mongoose = require('mongoose');

const IndexSchema = new mongoose.Schema({
  projectPath: { type: String, required: true },
  filePath: { type: String, required: true },
  content: { type: String },
  embedding: [Number],
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

IndexSchema.index({ projectPath: 1, filePath: 1 });

module.exports = mongoose.models.Index || mongoose.model('Index', IndexSchema);