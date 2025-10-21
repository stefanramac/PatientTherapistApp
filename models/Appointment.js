const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
  },
  therapistId: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeSlot: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  subject: String,
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema, 'appointments');

