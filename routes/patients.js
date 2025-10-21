const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - patientId
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         patientId:
 *           type: string
 *           description: Unique patient identifier
 *         firstName:
 *           type: string
 *           description: Patient's first name
 *         lastName:
 *           type: string
 *           description: Patient's last name
 *         email:
 *           type: string
 *           description: Patient's email address
 *         profile:
 *           type: object
 *           properties:
 *             age:
 *               type: number
 *             gender:
 *               type: string
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
 * /api/patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Patient already exists
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { patientId, firstName, lastName, email, profile, contactInfo } = req.body;

  try {
    const existingPatientEmail = await Patient.findOne({ email });
    const existingPatientUsername = await Patient.findOne({ patientId });

    if (existingPatientEmail) {
      return res.status(400).json({ message: `Patient with email ${email} already exists` });
    }

    if (existingPatientUsername) {
      return res.status(400).json({ message: `Patient with username ${patientId} already exists` });
    }

    const newPatient = new Patient({
      patientId,
      firstName,
      lastName,
      email,
      profile,
      contactInfo,
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient created successfully', patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
});

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of all patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID or email
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID or email
 *     responses:
 *       200:
 *         description: Patient data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let patient = await Patient.findOne({ patientId: id });
    
    if (!patient) {
      patient = await Patient.findOne({ email: id });
    }

    if (!patient) {
      return res.status(404).json({ message: `No patient found with ID or email ${id}` });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   patch:
 *     summary: Update patient information
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const patient = await Patient.findOneAndUpdate(
      { patientId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: `No patient found with ID ${id}` });
    }

    res.status(200).json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findOneAndDelete({ patientId: id });

    if (!patient) {
      return res.status(404).json({ message: `No patient found with ID ${id}` });
    }

    res.status(200).json({ message: 'Patient deleted successfully', patientId: id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
});

module.exports = router;

