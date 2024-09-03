const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');

const app = express();
const port = 3012; // New port for the getAppointment service

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

const Appointment = mongoose.model('Appointment', appointmentSchema, 'appointments');

// Route for getting an appointment or appointments based on different criteria
app.post('/getAppointment', async (req, res) => {
  const { appointmentId, therapistId, patientId, date } = req.body;

  try {
    let appointments;

    if (appointmentId) {
      // Case 1: Find appointment by appointmentId
      appointments = await Appointment.findOne({ appointmentId: appointmentId });
    } else if (therapistId) {
      // Case 2: Find all appointments by therapistId
      appointments = await Appointment.find({ therapistId: therapistId });
    } else if (patientId) {
      // Case 3: Find all appointments by patientId
      appointments = await Appointment.find({ patientId: patientId });
    } else if (date) {
      // Case 4: Find all appointments by date
      appointments = await Appointment.find({ date: date });
    } else {
      return res.status(400).json({ message: 'Invalid request: Provide appointmentId, therapistId, patientId, or date' });
    }

    if (!appointments || (Array.isArray(appointments) && appointments.length === 0)) {
      return res.status(404).json({ message: 'No appointments found for the given criteria' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/getAppointment`);
});