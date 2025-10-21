const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  recordType: {
    type: String,
    enum: ['diagnosis', 'medication', 'allergy', 'lab-result', 'history', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  diagnosis: {
    code: String, // ICD-10 code
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening'],
    },
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadDate: Date,
  }],
  addedBy: {
    type: String, // therapistId
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  confidential: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema, 'medical_records');

