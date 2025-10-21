const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  appointmentId: {
    type: String,
    required: true,
  },
  therapistId: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  sessionDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['initial', 'follow-up', 'emergency', 'final'],
    default: 'follow-up',
  },
  notes: {
    symptoms: String,
    observations: String,
    interventions: String,
    homework: String,
    progressNotes: String,
  },
  mood: {
    before: {
      type: Number,
      min: 1,
      max: 10,
    },
    after: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  goals: [String],
  nextSessionPlan: String,
  isCompleted: {
    type: Boolean,
    default: false,
  },
  confidential: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Session', sessionSchema, 'sessions');

