const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true, unique: true },
  type: { type: String, default: 'unknown' },
  language: { type: String },
  lastOpened: { type: Date, default: Date.now },
  taskCount: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema);