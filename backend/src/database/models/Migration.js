const mongoose = require('mongoose');

const MigrationSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  executedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Migration', MigrationSchema);
