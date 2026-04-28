const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  location: {
    type: String,
    trim: true
  },
  camera: {
    type: String,
    trim: true,
    default: ''
  },
  street: {
    type: String,
    trim: true,
    default: ''
  },
  purok: {
    type: String,
    trim: true,
    default: ''
  },
  barangay: {
    type: String,
    required: [true, 'Barangay is required'],
    trim: true
  },
  incidentType: {
    type: String,
    required: [true, 'Incident type is required'],
    trim: true
  },
  actionTaken: {
    type: String,
    required: [true, 'Action taken is required'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true
  },
  dispatchTo: {
    type: String,
    trim: true,
    default: ''
  },
  dispatchTime: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

observationSchema.index({ date: -1 });
observationSchema.index({ location: 1 });
observationSchema.index({ incidentType: 1 });
observationSchema.index({ actionTaken: 1 });

module.exports = mongoose.model('Observation', observationSchema);
