const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewId: {
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
  appointmentId: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  categories: {
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    effectiveness: {
      type: Number,
      min: 1,
      max: 5,
    },
    empathy: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  comment: String,
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  response: {
    content: String,
    respondedAt: Date,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  helpful: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema, 'reviews');

