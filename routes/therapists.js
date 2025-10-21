const express = require('express');
const router = express.Router();
const Therapist = require('../models/Therapist');

/**
 * @swagger
 * components:
 *   schemas:
 *     Therapist:
 *       type: object
 *       required:
 *         - therapistId
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         therapistId:
 *           type: string
 *           description: Unique therapist identifier
 *         firstName:
 *           type: string
 *           description: Therapist's first name
 *         lastName:
 *           type: string
 *           description: Therapist's last name
 *         email:
 *           type: string
 *           description: Therapist's email address
 *         type:
 *           type: string
 *           default: therapist
 *         profile:
 *           type: object
 *           properties:
 *             age:
 *               type: number
 *             gender:
 *               type: string
 *             specialization:
 *               type: string
 *             experience:
 *               type: number
 *         contactInfo:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             place:
 *               type: string
 *             country:
 *               type: string
 */

/**
 * @swagger
 * /api/therapists:
 *   post:
 *     summary: Create a new therapist
 *     tags: [Therapists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Therapist'
 *     responses:
 *       201:
 *         description: Therapist created successfully
 *       400:
 *         description: Therapist already exists
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { therapistId, firstName, lastName, email, profile, contactInfo } = req.body;

  try {
    const existingTherapistEmail = await Therapist.findOne({ email });
    const existingTherapistUsername = await Therapist.findOne({ therapistId });

    if (existingTherapistEmail) {
      return res.status(400).json({ message: `Therapist with email ${email} already exists` });
    }

    if (existingTherapistUsername) {
      return res.status(400).json({ message: `Therapist with username ${therapistId} already exists` });
    }

    const newTherapist = new Therapist({
      therapistId,
      firstName,
      lastName,
      email,
      profile,
      contactInfo,
    });

    await newTherapist.save();
    res.status(201).json({ message: 'Therapist created successfully', therapist: newTherapist });
  } catch (error) {
    res.status(500).json({ message: 'Error creating therapist', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists:
 *   get:
 *     summary: Get all therapists
 *     tags: [Therapists]
 *     responses:
 *       200:
 *         description: List of all therapists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Therapist'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.find({});
    res.status(200).json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapists', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{id}:
 *   get:
 *     summary: Get therapist by ID or email
 *     tags: [Therapists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID or email
 *     responses:
 *       200:
 *         description: Therapist data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Therapist'
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let therapist = await Therapist.findOne({ therapistId: id });
    
    if (!therapist) {
      therapist = await Therapist.findOne({ email: id });
    }

    if (!therapist) {
      return res.status(404).json({ message: `No therapist found with ID or email ${id}` });
    }

    res.status(200).json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapist', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{id}:
 *   patch:
 *     summary: Update therapist information
 *     tags: [Therapists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Therapist'
 *     responses:
 *       200:
 *         description: Therapist updated successfully
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const therapist = await Therapist.findOneAndUpdate(
      { therapistId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!therapist) {
      return res.status(404).json({ message: `No therapist found with ID ${id}` });
    }

    res.status(200).json({ message: 'Therapist updated successfully', therapist });
  } catch (error) {
    res.status(500).json({ message: 'Error updating therapist', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{id}:
 *   delete:
 *     summary: Delete a therapist
 *     tags: [Therapists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     responses:
 *       200:
 *         description: Therapist deleted successfully
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const therapist = await Therapist.findOneAndDelete({ therapistId: id });

    if (!therapist) {
      return res.status(404).json({ message: `No therapist found with ID ${id}` });
    }

    res.status(200).json({ message: 'Therapist deleted successfully', therapistId: id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting therapist', error: error.message });
  }
});

module.exports = router;

