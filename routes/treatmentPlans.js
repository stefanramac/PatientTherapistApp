const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const TreatmentPlan = require('../models/TreatmentPlan');

/**
 * @swagger
 * components:
 *   schemas:
 *     TreatmentPlan:
 *       type: object
 *       required:
 *         - patientId
 *         - therapistId
 *         - title
 *         - startDate
 *       properties:
 *         planId:
 *           type: string
 *         patientId:
 *           type: string
 *         therapistId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         goals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               goalId:
 *                 type: string
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, achieved, abandoned]
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [active, completed, on-hold, cancelled]
 */

/**
 * @swagger
 * /api/treatment-plans:
 *   post:
 *     summary: Create a new treatment plan
 *     tags: [Treatment Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TreatmentPlan'
 *     responses:
 *       201:
 *         description: Treatment plan created successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const planId = crypto.randomBytes(16).toString('hex');
    
    // Generate goal IDs if not provided
    if (req.body.goals && Array.isArray(req.body.goals)) {
      req.body.goals = req.body.goals.map(goal => ({
        ...goal,
        goalId: goal.goalId || crypto.randomBytes(8).toString('hex'),
      }));
    }

    const planData = {
      ...req.body,
      planId,
    };

    const newPlan = new TreatmentPlan(planData);
    await newPlan.save();

    res.status(201).json({ message: 'Treatment plan created successfully', plan: newPlan });
  } catch (error) {
    res.status(500).json({ message: 'Error creating treatment plan', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/patient/{patientId}:
 *   get:
 *     summary: Get all treatment plans for a patient
 *     tags: [Treatment Plans]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of treatment plans
 *       404:
 *         description: No treatment plans found
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const filter = { patientId: req.params.patientId };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const plans = await TreatmentPlan.find(filter).sort({ startDate: -1 });

    if (plans.length === 0) {
      return res.status(404).json({ message: 'No treatment plans found for this patient' });
    }

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving treatment plans', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/therapist/{therapistId}:
 *   get:
 *     summary: Get all treatment plans by a therapist
 *     tags: [Treatment Plans]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of treatment plans
 *       404:
 *         description: No treatment plans found
 *       500:
 *         description: Server error
 */
router.get('/therapist/:therapistId', async (req, res) => {
  try {
    const filter = { therapistId: req.params.therapistId };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const plans = await TreatmentPlan.find(filter).sort({ startDate: -1 });

    if (plans.length === 0) {
      return res.status(404).json({ message: 'No treatment plans found for this therapist' });
    }

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving treatment plans', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/{id}:
 *   get:
 *     summary: Get treatment plan by ID
 *     tags: [Treatment Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Treatment plan data
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({ planId: req.params.id });

    if (!plan) {
      return res.status(404).json({ message: `Treatment plan with ID ${req.params.id} not found` });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving treatment plan', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/{id}:
 *   patch:
 *     summary: Update treatment plan
 *     tags: [Treatment Plans]
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
 *             $ref: '#/components/schemas/TreatmentPlan'
 *     responses:
 *       200:
 *         description: Treatment plan updated successfully
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOneAndUpdate(
      { planId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: `Treatment plan with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Treatment plan updated successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Error updating treatment plan', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/{id}/goals/{goalId}:
 *   patch:
 *     summary: Update specific goal in treatment plan
 *     tags: [Treatment Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               progress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       404:
 *         description: Treatment plan or goal not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/goals/:goalId', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({ planId: req.params.id });

    if (!plan) {
      return res.status(404).json({ message: `Treatment plan with ID ${req.params.id} not found` });
    }

    const goalIndex = plan.goals.findIndex(g => g.goalId === req.params.goalId);
    
    if (goalIndex === -1) {
      return res.status(404).json({ message: `Goal with ID ${req.params.goalId} not found` });
    }

    // Update specific goal fields
    Object.keys(req.body).forEach(key => {
      plan.goals[goalIndex][key] = req.body[key];
    });

    await plan.save();

    res.status(200).json({ message: 'Goal updated successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/{id}/milestones:
 *   post:
 *     summary: Add milestone to treatment plan
 *     tags: [Treatment Plans]
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Milestone added successfully
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Server error
 */
router.post('/:id/milestones', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({ planId: req.params.id });

    if (!plan) {
      return res.status(404).json({ message: `Treatment plan with ID ${req.params.id} not found` });
    }

    plan.milestones.push(req.body);
    await plan.save();

    res.status(200).json({ message: 'Milestone added successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Error adding milestone', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/{id}:
 *   delete:
 *     summary: Delete a treatment plan
 *     tags: [Treatment Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Treatment plan deleted successfully
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOneAndDelete({ planId: req.params.id });

    if (!plan) {
      return res.status(404).json({ message: `Treatment plan with ID ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Treatment plan deleted successfully', planId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting treatment plan', error: error.message });
  }
});

/**
 * @swagger
 * /api/treatment-plans/patient/{patientId}/progress:
 *   get:
 *     summary: Get overall progress for patient's treatment plans
 *     tags: [Treatment Plans]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress data
 *       404:
 *         description: No treatment plans found
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId/progress', async (req, res) => {
  try {
    const plans = await TreatmentPlan.find({ patientId: req.params.patientId });

    if (plans.length === 0) {
      return res.status(404).json({ message: 'No treatment plans found for this patient' });
    }

    const allGoals = plans.flatMap(p => p.goals || []);
    
    const progressData = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === 'active').length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      totalGoals: allGoals.length,
      goalsAchieved: allGoals.filter(g => g.status === 'achieved').length,
      goalsInProgress: allGoals.filter(g => g.status === 'in-progress').length,
      overallProgress: allGoals.length > 0 
        ? (allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length).toFixed(2)
        : 0,
      plansByStatus: plans.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}),
    };

    res.status(200).json(progressData);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving progress data', error: error.message });
  }
});

module.exports = router;

