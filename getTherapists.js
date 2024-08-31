const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3005; // Postavljen drugi port kako bi se izbegli konflikti

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

// Definisanje šeme za terapeute (ponovo koristiti istu šemu)
const therapistSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  type: { type: String, default: 'therapist' },
  profile: {
    age: Number,
    gender: String,
    specialization: String,
    experience: Number,
  },
  contactInfo: {
    phone: String,
    address: String,
    place: String,
    country: String,
  },
  therapistId: String,
});

const Therapist = mongoose.model('Therapist', therapistSchema);

// Ruta za dohvaćanje svih terapeuta
app.get('/getTherapists', async (req, res) => {
  try {
    const therapists = await Therapist.find({});
    res.status(200).json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapists', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/getTherapists`);
});