const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Message = require('../models/Message');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - senderId
 *         - senderType
 *         - receiverId
 *         - receiverType
 *         - content
 *       properties:
 *         messageId:
 *           type: string
 *         conversationId:
 *           type: string
 *         senderId:
 *           type: string
 *         senderType:
 *           type: string
 *           enum: [patient, therapist]
 *         receiverId:
 *           type: string
 *         receiverType:
 *           type: string
 *           enum: [patient, therapist]
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [text, appointment-request, prescription, document, emergency]
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         isRead:
 *           type: boolean
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const messageId = crypto.randomBytes(16).toString('hex');
    
    // Generate conversation ID if not provided (combination of sender and receiver IDs)
    const conversationId = req.body.conversationId || 
      [req.body.senderId, req.body.receiverId].sort().join('-');

    const messageData = {
      ...req.body,
      messageId,
      conversationId,
    };

    const newMessage = new Message(messageData);
    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/conversation/{conversationId}:
 *   get:
 *     summary: Get all messages in a conversation
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: No messages found
 *       500:
 *         description: Server error
 */
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ 
      conversationId: req.params.conversationId 
    }).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found in this conversation' });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/user/{userId}:
 *   get:
 *     summary: Get all conversations for a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of conversations
 *       404:
 *         description: No messages found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const filter = {
      $or: [
        { senderId: req.params.userId },
        { receiverId: req.params.userId }
      ]
    };

    if (req.query.unreadOnly === 'true') {
      filter.isRead = false;
      filter.receiverId = req.params.userId;
    }

    const messages = await Message.find(filter).sort({ createdAt: -1 });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found for this user' });
    }

    // Group messages by conversation
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversationId]) {
        conversations[msg.conversationId] = {
          conversationId: msg.conversationId,
          lastMessage: msg,
          unreadCount: 0,
          messages: []
        };
      }
      conversations[msg.conversationId].messages.push(msg);
      if (!msg.isRead && msg.receiverId === req.params.userId) {
        conversations[msg.conversationId].unreadCount++;
      }
    });

    res.status(200).json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message data
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findOne({ messageId: req.params.id });

    if (!message) {
      return res.status(404).json({ message: `Message with ID ${req.params.id} not found` });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving message', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{id}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { messageId: req.params.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: `Message with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Message marked as read', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({ messageId: req.params.id });

    if (!message) {
      return res.status(404).json({ message: `Message with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Message deleted successfully', messageId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

module.exports = router;

