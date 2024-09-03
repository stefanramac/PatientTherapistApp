const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto'); // Importing crypto for generating unique appointmentId
const config = require('./config');

const app = express();
const port = 3010; // New port for the createAppointment service

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
  writeConcern: {
    w: "majority",
    wtimeout: 1000
  }
});

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Defining the schema for therapist availability
const therapistAvailabilitySchema = new mongoose.Schema({
  therapistId: String,
  availability: [
    {
      date: String,
      time_slots: [
        {
          start: String,
          end: String,
        },
      ],
    },
  ],
});

// Defining the schema for therapist unavailability
const therapistUnavailabilitySchema = new mongoose.Schema({
  therapistId: String,
  unavailability: [
    {
      date: String,
      time_slots: [
        {
          start: String,
          end: String,
        },
      ],
    },
  ],
});

// Defining the schema for appointments
const appointmentSchema = new mongoose.Schema({
  appointmentId: String,
  therapistId: String,
  patientId: String,
  date: String,
  timeSlot: {
    start: String,
    end: String,
  },
  status: String,
  subject: String,
  notes: String,
});

const TherapistAvailability = mongoose.model('TherapistAvailability', therapistAvailabilitySchema, 'therapist_availability');
const TherapistUnavailability = mongoose.model('TherapistUnavailability', therapistUnavailabilitySchema, 'therapist_unavailability');
const Appointment = mongoose.model('Appointment', appointmentSchema, 'appointments');

// Function to generate a unique appointment ID
function generateUniqueId() {
  return crypto.randomBytes(16).toString("hex");
}

// Route for creating a new appointment
app.post('/createAppointment', async (req, res) => {
  const { therapistId, patientId, date, timeSlot, status, subject, notes } = req.body;

  try {
    // Step 1: Verify that the requested time slot is within the therapist's availability
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId: therapistId });
    
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
      return res.status(400).json({ message: 'Requested time slot is not within the therapist’s availability.' });
    }

    // Step 2: Verify that the requested time slot is not already booked
    const therapistUnavailability = await TherapistUnavailability.findOne({ therapistId: therapistId });

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
      appointmentId: appointmentId,
      therapistId: therapistId,
      patientId: patientId,
      date: date,
      timeSlot: timeSlot,
      status: status,
      subject: subject,
      notes: notes,
    });

    await newAppointment.save();

    // Step 4: Update therapist unavailability with the new booking
    if (therapistUnavailability) {
      const unavailabilityEntry = therapistUnavailability.unavailability.find(entry => entry.date === date);

      if (unavailabilityEntry) {
        unavailabilityEntry.time_slots.push(timeSlot);
      } else {
        therapistUnavailability.unavailability.push({ date: date, time_slots: [timeSlot] });
      }

      await therapistUnavailability.save();
    } else {
      const newUnavailability = new TherapistUnavailability({
        therapistId: therapistId,
        unavailability: [{ date: date, time_slots: [timeSlot] }],
      });

      await newUnavailability.save();
    }

    // Returning the created appointmentId in the response
    res.status(201).json({ message: 'Appointment created successfully', appointmentId: appointmentId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/createAppointment`);
});