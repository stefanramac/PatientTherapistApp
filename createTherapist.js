const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3002; // Koristimo drugi port da izbegnemo konflikte

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

// Definisanje šeme za terapeute
const therapistSchema = new mongoose.Schema({
  therapistId: String,
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
  }
});

const Therapist = mongoose.model('Therapist', therapistSchema);

app.post('/createTherapist', async (req, res) => {
  const { firstName, lastName, email, profile, contactInfo, therapistId } = req.body;

  try {
    // Provera da li već postoji terapeut sa datim emailom
    const existingTherapistEmail = await Therapist.findOne({ email: email });
    const existingTherapistUsername = await Therapist.findOne({ therapistId: therapistId });

    if (existingTherapistEmail) {
      return res.status(400).json({ message: `Therapist with email ${email} already exists` });
    }
    if (existingTherapistUsername) {
      return res.status(400).json({ message: `Therapist with username ${therapistId} already exists` });
    }
    
    // Ako ne postoji, kreira se novi terapeut
    const newTherapist = new Therapist({
      therapistId: therapistId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      profile: profile,
      contactInfo: contactInfo
    });

    await newTherapist.save();
    res.status(201).json({ message: 'Therapist created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating therapist', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/createTherapist`);
});