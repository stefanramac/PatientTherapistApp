const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3000; // Postavljen drugi port kako bi se izbegli konflikti

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

// Definisanje šeme za dostupnost terapeuta
const availabilitySchema = new mongoose.Schema({
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

const Availability = mongoose.model('Availability', availabilitySchema, 'therapist_unavailability');

// Ruta za proveru dostupnosti terapeuta prema therapistId
app.post('/checkAvailability', async (req, res) => {
  const { therapistId } = req.body;

  try {
    // Dohvatanje dokumenta na osnovu therapistId
    const availability = await Availability.findOne({ therapistId: therapistId });

    if (!availability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/checkAvailability`);
});
