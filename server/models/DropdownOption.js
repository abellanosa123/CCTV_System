const mongoose = require('mongoose');

const dropdownOptionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['incidentType', 'location', 'actionTaken']
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

dropdownOptionSchema.index({ category: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('DropdownOption', dropdownOptionSchema);
