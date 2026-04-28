const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Requesting Party
  dateRequested: {
    type: String,
    required: [true, 'Date requested is required']
  },
  timeRequested: {
    type: String,
    required: [true, 'Time requested is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  // Requested Playback
  location: {
    type: String,
    trim: true
  },
  camera: {
    type: String,
    trim: true
  },
  street: {
    type: String,
    trim: true
  },
  purok: {
    type: String,
    trim: true
  },
  barangay: {
    type: String,
    required: [true, 'Barangay is required'],
    trim: true
  },
  incidentDate: {
    type: String,
    required: [true, 'Incident date is required']
  },
  incidentTime: {
    type: String,
    required: [true, 'Incident time is required']
  },
  incidentType: {
    type: String,
    required: [true, 'Incident type is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  // Reviewed By
  reviewedBy: {
    type: String,
    trim: true
  },
  result: {
    type: String,
    trim: true,
    default: ''
  },
  // Footage Outcome
  outcome: {
    type: String,
    enum: ['Useful', 'Somehow Useful', 'Not Useful', ''],
    default: ''
  },
  caughtOnCam: {
    type: String,
    enum: ['Captured', 'Uncaptured', ''],
    default: ''
  },
  // Client Feedback
  comments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Released'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

reviewSchema.index({ dateRequested: -1 });
reviewSchema.index({ location: 1 });
reviewSchema.index({ incidentType: 1 });
reviewSchema.index({ name: 1 });
reviewSchema.index({ status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
