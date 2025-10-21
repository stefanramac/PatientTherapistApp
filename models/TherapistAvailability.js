const mongoose = require('mongoose');

const therapistAvailabilitySchema = new mongoose.Schema({
  therapistId: {
    type: String,
    required: true,
    unique: true,
  },
  availability: [
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

module.exports = mongoose.model('TherapistAvailability', therapistAvailabilitySchema, 'therapist_availability');

