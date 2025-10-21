const mongoose = require('mongoose');

const treatmentPlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  therapistId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  diagnosis: {
    primary: String,
    secondary: [String],
  },
  goals: [{
    goalId: String,
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'achieved', 'abandoned'],
      default: 'not-started',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  }],
  interventions: [{
    type: String,
    description: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    prescribedDate: Date,
  }],
  sessionFrequency: {
    sessions: Number,
    period: {
      type: String,
      enum: ['week', 'month'],
    },
  },
  duration: {
    estimated: Number, // in weeks
    actual: Number,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active',
  },
  milestones: [{
    title: String,
    description: String,
    targetDate: Date,
    achievedDate: Date,
    isAchieved: {
      type: Boolean,
      default: false,
    },
  }],
  notes: String,
  reviewDate: Date,
  lastUpdatedBy: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema, 'treatment_plans');

