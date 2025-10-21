const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Session = require('../models/Session');

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       required:
 *         - appointmentId
 *         - therapistId
 *         - patientId
 *         - sessionDate
 *         - duration
 *       properties:
 *         sessionId:
 *           type: string
 *           description: Auto-generated unique session ID
 *         appointmentId:
 *           type: string
 *         therapistId:
 *           type: string
 *         patientId:
 *           type: string
 *         sessionDate:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         sessionType:
 *           type: string
 *           enum: [initial, follow-up, emergency, final]
 *         notes:
 *           type: object
 *           properties:
 *             symptoms:
 *               type: string
 *             observations:
 *               type: string
 *             interventions:
 *               type: string
 *             homework:
 *               type: string
 *             progressNotes:
 *               type: string
 *         mood:
 *           type: object
 *           properties:
 *             before:
 *               type: number
 *               minimum: 1
 *               maximum: 10
 *             after:
 *               type: number
 *               minimum: 1
 *               maximum: 10
 *         goals:
 *           type: array
 *           items:
 *             type: string
 *         nextSessionPlan:
 *           type: string
 *         isCompleted:
 *           type: boolean
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new therapy session record
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Session'
 *     responses:
 *       201:
 *         description: Session created successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const sessionData = {
      ...req.body,
      sessionId,
    };

    const newSession = new Session(sessionData);
    await newSession.save();

    res.status(201).json({ message: 'Session created successfully', session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
});

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get sessions with optional filters
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: appointmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sessionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of sessions
 *       404:
 *         description: No sessions found
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.therapistId) filter.therapistId = req.query.therapistId;
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.appointmentId) filter.appointmentId = req.query.appointmentId;
    if (req.query.sessionType) filter.sessionType = req.query.sessionType;
    if (req.query.isCompleted !== undefined) filter.isCompleted = req.query.isCompleted === 'true';

    const sessions = await Session.find(filter).sort({ sessionDate: -1 });

    if (sessions.length === 0) {
      return res.status(404).json({ message: 'No sessions found' });
    }

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sessions', error: error.message });
  }
});

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session data
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });

    if (!session) {
      return res.status(404).json({ message: `Session with ID ${req.params.id} not found` });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving session', error: error.message });
  }
});

/**
 * @swagger
 * /api/sessions/{id}:
 *   patch:
 *     summary: Update session information
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Session'
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: `Session with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Session updated successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
});

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ sessionId: req.params.id });

    if (!session) {
      return res.status(404).json({ message: `Session with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Session deleted successfully', sessionId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
});

/**
 * @swagger
 * /api/sessions/patient/{patientId}/progress:
 *   get:
 *     summary: Get patient progress over time
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient progress data
 *       404:
 *         description: No sessions found
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId/progress', async (req, res) => {
  try {
    const sessions = await Session.find({ 
      patientId: req.params.patientId,
      isCompleted: true 
    }).sort({ sessionDate: 1 });

    if (sessions.length === 0) {
      return res.status(404).json({ message: 'No completed sessions found for this patient' });
    }

    const progressData = {
      totalSessions: sessions.length,
      moodProgress: sessions.map(s => ({
        date: s.sessionDate,
        before: s.mood?.before,
        after: s.mood?.after,
        improvement: s.mood?.after - s.mood?.before,
      })),
      sessionTypes: sessions.reduce((acc, s) => {
        acc[s.sessionType] = (acc[s.sessionType] || 0) + 1;
        return acc;
      }, {}),
      averageImprovement: sessions
        .filter(s => s.mood?.before && s.mood?.after)
        .reduce((sum, s) => sum + (s.mood.after - s.mood.before), 0) / sessions.length,
    };

    res.status(200).json(progressData);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving progress data', error: error.message });
  }
});

module.exports = router;

