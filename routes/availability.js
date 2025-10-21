const express = require('express');
const router = express.Router();
const TherapistAvailability = require('../models/TherapistAvailability');
const TherapistUnavailability = require('../models/TherapistUnavailability');

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeSlot:
 *       type: object
 *       properties:
 *         start:
 *           type: string
 *           description: Start time (HH:MM)
 *         end:
 *           type: string
 *           description: End time (HH:MM)
 *     AvailabilityEntry:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           description: Date (YYYY-MM-DD)
 *         time_slots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *     TherapistAvailability:
 *       type: object
 *       properties:
 *         therapistId:
 *           type: string
 *         availability:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AvailabilityEntry'
 */

/**
 * @swagger
 * /api/therapists/{therapistId}/availability:
 *   get:
 *     summary: Get therapist availability
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     responses:
 *       200:
 *         description: Therapist availability
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TherapistAvailability'
 *       404:
 *         description: No availability found
 *       500:
 *         description: Server error
 */
router.get('/:therapistId/availability', async (req, res) => {
  const { therapistId } = req.params;

  try {
    const availability = await TherapistAvailability.findOne({ therapistId });

    if (!availability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{therapistId}/availability:
 *   post:
 *     summary: Add or update therapist work time (availability)
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date (YYYY-MM-DD)
 *               time_slots:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimeSlot'
 *     responses:
 *       200:
 *         description: Work time added successfully
 *       201:
 *         description: New availability created
 *       400:
 *         description: Conflicting time slots
 *       500:
 *         description: Server error
 */
router.post('/:therapistId/availability', async (req, res) => {
  const { therapistId } = req.params;
  const { date, time_slots } = req.body;

  try {
    let therapistAvailability = await TherapistAvailability.findOne({ therapistId });

    if (!therapistAvailability) {
      const newAvailability = new TherapistAvailability({
        therapistId,
        availability: [{ date, time_slots }]
      });
      await newAvailability.save();
      return res.status(201).json({ message: 'Work time added successfully', availability: newAvailability });
    }

    let availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (availabilityEntry) {
      const overlappingSlots = availabilityEntry.time_slots.filter(existingSlot =>
        time_slots.some(newSlot =>
          (newSlot.start < existingSlot.end && newSlot.end > existingSlot.start)
        )
      );

      if (overlappingSlots.length > 0) {
        return res.status(400).json({ message: 'Conflicting time slots found', overlappingSlots });
      }

      availabilityEntry.time_slots.push(...time_slots);
    } else {
      therapistAvailability.availability.push({ date, time_slots });
    }

    await therapistAvailability.save();
    res.status(200).json({ message: 'Work time added successfully', availability: therapistAvailability });
  } catch (error) {
    res.status(500).json({ message: 'Error adding work time', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{therapistId}/availability:
 *   delete:
 *     summary: Delete therapist work time (availability)
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date (YYYY-MM-DD)
 *               time_slots:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimeSlot'
 *                 description: Optional - if not provided, entire date will be deleted
 *     responses:
 *       200:
 *         description: Work time deleted successfully
 *       404:
 *         description: Availability not found
 *       500:
 *         description: Server error
 */
router.delete('/:therapistId/availability', async (req, res) => {
  const { therapistId } = req.params;
  const { date, time_slots } = req.body;

  try {
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId });

    if (!therapistAvailability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    let availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (!availabilityEntry) {
      return res.status(404).json({ message: `No availability found for date ${date}` });
    }

    if (time_slots && time_slots.length > 0) {
      const nonExistingSlots = time_slots.filter(slotToDelete =>
        !availabilityEntry.time_slots.some(existingSlot =>
          slotToDelete.start === existingSlot.start && slotToDelete.end === existingSlot.end
        )
      );

      if (nonExistingSlots.length > 0) {
        return res.status(404).json({ message: 'One or more time slots do not exist', nonExistingSlots });
      }

      availabilityEntry.time_slots = availabilityEntry.time_slots.filter(existingSlot =>
        !time_slots.some(slotToDelete =>
          slotToDelete.start === existingSlot.start && slotToDelete.end === existingSlot.end
        )
      );

      if (availabilityEntry.time_slots.length === 0) {
        therapistAvailability.availability = therapistAvailability.availability.filter(entry => entry.date !== date);
      }
    } else {
      therapistAvailability.availability = therapistAvailability.availability.filter(entry => entry.date !== date);
    }

    await therapistAvailability.save();
    res.status(200).json({ message: 'Work time deleted successfully', availability: therapistAvailability });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting work time', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{therapistId}/unavailability:
 *   get:
 *     summary: Get therapist unavailability (booked time slots)
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     responses:
 *       200:
 *         description: Therapist unavailability
 *       404:
 *         description: No unavailability found
 *       500:
 *         description: Server error
 */
router.get('/:therapistId/unavailability', async (req, res) => {
  const { therapistId } = req.params;

  try {
    const unavailability = await TherapistUnavailability.findOne({ therapistId });

    if (!unavailability) {
      return res.status(404).json({ message: `No unavailability found for therapist with ID ${therapistId}` });
    }

    res.status(200).json(unavailability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unavailability', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{therapistId}/unavailability:
 *   post:
 *     summary: Add unavailable time slots for therapist
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date (YYYY-MM-DD)
 *               time_slots:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimeSlot'
 *     responses:
 *       200:
 *         description: Time slots updated successfully
 *       400:
 *         description: Time slot not within availability or duplicate
 *       404:
 *         description: Therapist availability not found
 *       500:
 *         description: Server error
 */
router.post('/:therapistId/unavailability', async (req, res) => {
  const { therapistId } = req.params;
  const { date, time_slots } = req.body;

  try {
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId });

    if (!therapistAvailability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    const availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (!availabilityEntry) {
      return res.status(400).json({ message: `Therapist is not available on date ${date}` });
    }

    const isAvailable = time_slots.every(newSlot =>
      availabilityEntry.time_slots.some(availableSlot =>
        newSlot.start >= availableSlot.start && newSlot.end <= availableSlot.end
      )
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'One or more time slots are not within the therapist\'s availability.' });
    }

    let unavailability = await TherapistUnavailability.findOne({ therapistId });

    if (!unavailability) {
      unavailability = new TherapistUnavailability({
        therapistId,
        unavailability: [{ date, time_slots }]
      });
      await unavailability.save();
      return res.status(201).json({ message: 'Time slots added successfully', unavailability });
    }

    const dateEntry = unavailability.unavailability.find(entry => entry.date === date);

    if (dateEntry) {
      const duplicateSlots = dateEntry.time_slots.filter(slot =>
        time_slots.some(newSlot => newSlot.start === slot.start && newSlot.end === slot.end)
      );

      if (duplicateSlots.length > 0) {
        return res.status(400).json({ message: 'Duplicate time slots found for the same date.' });
      }

      dateEntry.time_slots.push(...time_slots);
    } else {
      unavailability.unavailability.push({ date, time_slots });
    }

    await unavailability.save();
    res.status(200).json({ message: 'Time slots updated successfully', unavailability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating time slots', error: error.message });
  }
});

/**
 * @swagger
 * /api/therapists/{therapistId}/unavailability:
 *   delete:
 *     summary: Delete unavailable time slots for therapist
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         schema:
 *           type: string
 *         required: true
 *         description: Therapist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date (YYYY-MM-DD)
 *               time_slots:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimeSlot'
 *                 description: Optional - if not provided, entire date will be deleted
 *     responses:
 *       200:
 *         description: Time slots deleted successfully
 *       404:
 *         description: Unavailability not found
 *       500:
 *         description: Server error
 */
router.delete('/:therapistId/unavailability', async (req, res) => {
  const { therapistId } = req.params;
  const { date, time_slots } = req.body;

  try {
    const unavailability = await TherapistUnavailability.findOne({ therapistId });

    if (!unavailability) {
      return res.status(404).json({ message: `No unavailability found for therapist with ID ${therapistId}` });
    }

    const dateEntry = unavailability.unavailability.find(entry => entry.date === date);

    if (!dateEntry) {
      return res.status(404).json({ message: `No unavailability found for therapist on date ${date}` });
    }

    if (!time_slots || time_slots.length === 0) {
      unavailability.unavailability = unavailability.unavailability.filter(entry => entry.date !== date);
    } else {
      const slotsToDelete = time_slots.filter(newSlot =>
        dateEntry.time_slots.some(slot => slot.start === newSlot.start && slot.end === newSlot.end)
      );

      if (slotsToDelete.length === 0) {
        return res.status(404).json({ message: 'The specified time slots do not exist in the database.' });
      }

      dateEntry.time_slots = dateEntry.time_slots.filter(slot =>
        !slotsToDelete.some(deleteSlot => deleteSlot.start === slot.start && deleteSlot.end === slot.end)
      );

      if (dateEntry.time_slots.length === 0) {
        unavailability.unavailability = unavailability.unavailability.filter(entry => entry.date !== date);
      }
    }

    await unavailability.save();
    res.status(200).json({ message: 'Time slots deleted successfully', unavailability });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time slots', error: error.message });
  }
});

module.exports = router;

