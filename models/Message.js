const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    enum: ['patient', 'therapist'],
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  receiverType: {
    type: String,
    enum: ['patient', 'therapist'],
    required: true,
  },
  subject: String,
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'appointment-request', 'prescription', 'document', 'emergency'],
    default: 'text',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema, 'messages');

