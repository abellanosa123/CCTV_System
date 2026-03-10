const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema({
  originalReviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  releaseDate: {
    type: String,
    required: true
  },
  // Copied from original review
  name: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  incidentDate: {
    type: String
  },
  incidentTime: {
    type: String
  },
  incidentType: {
    type: String,
    required: [true, 'Incident type is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  requestedBy: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

releaseSchema.index({ releaseDate: -1 });
releaseSchema.index({ location: 1 });
releaseSchema.index({ incidentType: 1 });

module.exports = mongoose.model('Release', releaseSchema);
