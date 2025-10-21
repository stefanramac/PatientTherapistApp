const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  therapistId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    default: 'therapist',
  },
  profile: {
    age: Number,
    gender: String,
    specialization: String,
    experience: Number,
  },
  contactInfo: {
    phone: String,
    address: String,
    place: String,
    country: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Therapist', therapistSchema);

