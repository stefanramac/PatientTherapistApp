const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
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
  profile: {
    age: Number,
    gender: String,
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

module.exports = mongoose.model('Patient', patientSchema);

