const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const TherapistAvailability = require('../models/TherapistAvailability');
const TherapistUnavailability = require('../models/TherapistUnavailability');

// Function to generate a unique appointment ID
function generateUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - therapistId
 *         - patientId
 *         - date
 *         - timeSlot
 *       properties:
 *         appointmentId:
 *           type: string
 *           description: Unique appointment identifier (auto-generated)
 *         therapistId:
 *           type: string
 *           description: Therapist's ID
 *         patientId:
 *           type: string
 *           description: Patient's ID
 *         date:
 *           type: string
 *           description: Appointment date (YYYY-MM-DD)
 *         timeSlot:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               description: Start time (HH:MM)
 *             end:
 *               type: string
 *               description: End time (HH:MM)
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled, rescheduled]
 *           default: scheduled
 *         subject:
 *           type: string
 *           description: Appointment subject
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Time slot not available or invalid
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { therapistId, patientId, date, timeSlot, status, subject, notes } = req.body;

  try {
    // Step 1: Verify that the requested time slot is within the therapist's availability
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId });

    if (!therapistAvailability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    const availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (!availabilityEntry) {
      return res.status(400).json({ message: `Therapist is not available on date ${date}` });
    }

    const isAvailable = availabilityEntry.time_slots.some(slot =>
      timeSlot.start >= slot.start && timeSlot.end <= slot.end
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'Requested time slot is not within the therapist\'s availability.' });
    }

    // Step 2: Verify that the requested time slot is not already booked
    const therapistUnavailability = await TherapistUnavailability.findOne({ therapistId });

    if (therapistUnavailability) {
      const unavailabilityEntry = therapistUnavailability.unavailability.find(entry => entry.date === date);

      if (unavailabilityEntry) {
        const isBooked = unavailabilityEntry.time_slots.some(slot =>
          timeSlot.start === slot.start && timeSlot.end === slot.end
        );

        if (isBooked) {
          return res.status(400).json({ message: 'Time slot is already booked.' });
        }
      }
    }

    // Step 3: Create a new appointment
    const appointmentId = generateUniqueId();
    const newAppointment = new Appointment({
      appointmentId,
      therapistId,
      patientId,
      date,
      timeSlot,
      status: status || 'scheduled',
      subject,
      notes,
    });

    await newAppointment.save();

    // Step 4: Update therapist unavailability with the new booking
    if (therapistUnavailability) {
      const unavailabilityEntry = therapistUnavailability.unavailability.find(entry => entry.date === date);

      if (unavailabilityEntry) {
        unavailabilityEntry.time_slots.push(timeSlot);
      } else {
        therapistUnavailability.unavailability.push({ date, time_slots: [timeSlot] });
      }

      await therapistUnavailability.save();
    } else {
      const newUnavailability = new TherapistUnavailability({
        therapistId,
        unavailability: [{ date, time_slots: [timeSlot] }],
      });

      await newUnavailability.save();
    }

    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get appointments with optional filters
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *         description: Filter by therapist ID
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filter by date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: No appointments found
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  const { therapistId, patientId, date, status } = req.query;

  try {
    const filter = {};
    if (therapistId) filter.therapistId = therapistId;
    if (patientId) filter.patientId = patientId;
    if (date) filter.date = date;
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter);

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for the given criteria' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findOne({ appointmentId: id });

    if (!appointment) {
      return res.status(404).json({ message: `No appointment found with ID ${id}` });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointment', error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     summary: Update appointment status or details
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               subject:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const appointment = await Appointment.findOneAndUpdate(
      { appointmentId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: `No appointment found with ID ${id}` });
    }

    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findOneAndDelete({ appointmentId: id });

    if (!appointment) {
      return res.status(404).json({ message: `Appointment with ID ${id} not found` });
    }

    // Remove from therapist unavailability
    const therapistUnavailability = await TherapistUnavailability.findOne({ therapistId: appointment.therapistId });
    
    if (therapistUnavailability) {
      const unavailabilityEntry = therapistUnavailability.unavailability.find(entry => entry.date === appointment.date);
      
      if (unavailabilityEntry) {
        unavailabilityEntry.time_slots = unavailabilityEntry.time_slots.filter(slot =>
          !(slot.start === appointment.timeSlot.start && slot.end === appointment.timeSlot.end)
        );
        
        if (unavailabilityEntry.time_slots.length === 0) {
          therapistUnavailability.unavailability = therapistUnavailability.unavailability.filter(
            entry => entry.date !== appointment.date
          );
        }
        
        await therapistUnavailability.save();
      }
    }

    res.status(200).json({ message: 'Appointment deleted successfully', appointmentId: id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

module.exports = router;

