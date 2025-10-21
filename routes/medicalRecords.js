const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalRecord:
 *       type: object
 *       required:
 *         - patientId
 *         - recordType
 *         - title
 *         - addedBy
 *       properties:
 *         recordId:
 *           type: string
 *           description: Auto-generated unique record ID
 *         patientId:
 *           type: string
 *         recordType:
 *           type: string
 *           enum: [diagnosis, medication, allergy, lab-result, history, other]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         diagnosis:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             name:
 *               type: string
 *             severity:
 *               type: string
 *               enum: [mild, moderate, severe]
 *         addedBy:
 *           type: string
 *           description: Therapist ID who added the record
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Create a new medical record
 *     tags: [Medical Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalRecord'
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const recordId = crypto.randomBytes(16).toString('hex');
    const recordData = {
      ...req.body,
      recordId,
    };

    const newRecord = new MedicalRecord(recordData);
    await newRecord.save();

    res.status(201).json({ message: 'Medical record created successfully', record: newRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error creating medical record', error: error.message });
  }
});

/**
 * @swagger
 * /api/medical-records/patient/{patientId}:
 *   get:
 *     summary: Get all medical records for a patient
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: recordType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of medical records
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const filter = { patientId: req.params.patientId };
    
    if (req.query.recordType) filter.recordType = req.query.recordType;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No medical records found for this patient' });
    }

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving medical records', error: error.message });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   get:
 *     summary: Get medical record by ID
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical record data
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ recordId: req.params.id });

    if (!record) {
      return res.status(404).json({ message: `Medical record with ID ${req.params.id} not found` });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving medical record', error: error.message });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   patch:
 *     summary: Update medical record
 *     tags: [Medical Records]
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
 *             $ref: '#/components/schemas/MedicalRecord'
 *     responses:
 *       200:
 *         description: Medical record updated successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndUpdate(
      { recordId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ message: `Medical record with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Medical record updated successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medical record', error: error.message });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   delete:
 *     summary: Delete a medical record
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical record deleted successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndDelete({ recordId: req.params.id });

    if (!record) {
      return res.status(404).json({ message: `Medical record with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Medical record deleted successfully', recordId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medical record', error: error.message });
  }
});

/**
 * @swagger
 * /api/medical-records/patient/{patientId}/summary:
 *   get:
 *     summary: Get medical summary for a patient
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient medical summary
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId/summary', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ 
      patientId: req.params.patientId,
      isActive: true 
    });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No medical records found for this patient' });
    }

    const summary = {
      totalRecords: records.length,
      recordsByType: records.reduce((acc, r) => {
        acc[r.recordType] = (acc[r.recordType] || 0) + 1;
        return acc;
      }, {}),
      activeDiagnoses: records.filter(r => r.recordType === 'diagnosis').map(r => ({
        code: r.diagnosis?.code,
        name: r.diagnosis?.name,
        severity: r.diagnosis?.severity,
        addedDate: r.createdAt,
      })),
      currentMedications: records
        .filter(r => r.recordType === 'medication' && r.medications?.length > 0)
        .flatMap(r => r.medications)
        .filter(m => !m.endDate || new Date(m.endDate) > new Date()),
      allergies: records
        .filter(r => r.recordType === 'allergy' && r.allergies?.length > 0)
        .flatMap(r => r.allergies),
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving medical summary', error: error.message });
  }
});

module.exports = router;

