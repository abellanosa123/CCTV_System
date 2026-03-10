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
    required: [true, 'Location is required'],
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
  }
}, {
  timestamps: true
});

observationSchema.index({ date: -1 });
observationSchema.index({ location: 1 });
observationSchema.index({ incidentType: 1 });
observationSchema.index({ actionTaken: 1 });

module.exports = mongoose.model('Observation', observationSchema);
