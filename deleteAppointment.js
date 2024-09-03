const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');

const app = express();
const port = 3011; // New port for the deleteAppointment service

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

// Route for deleting an appointment
app.delete('/deleteAppointment', async (req, res) => {
  const { appointmentId } = req.body;

  try {
    // Find and delete the appointment by its appointmentId
    const deletedAppointment = await Appointment.findOneAndDelete({ appointmentId: appointmentId });

    if (!deletedAppointment) {
      // If the appointment doesn't exist, return an error response
      return res.status(404).json({ message: `Appointment with ID ${appointmentId} not found` });
    }

    // Return a success message if the appointment was deleted
    res.status(200).json({ message: 'Appointment deleted successfully', appointmentId: appointmentId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/deleteAppointment`);
});