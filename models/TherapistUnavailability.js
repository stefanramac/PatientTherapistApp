const mongoose = require('mongoose');

const therapistUnavailabilitySchema = new mongoose.Schema({
  therapistId: {
    type: String,
    required: true,
    unique: true,
  },
  unavailability: [
    {
      date: {
        type: String,
        required: true,
      },
      time_slots: [
        {
          start: {
            type: String,
            required: true,
          },
          end: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('TherapistUnavailability', therapistUnavailabilitySchema, 'therapist_unavailability');

