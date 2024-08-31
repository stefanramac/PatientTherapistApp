const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3001; // Postavljen drugi port kako bi se izbegli konflikti

app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Definisanje šeme za pacijente
const patientSchema = new mongoose.Schema({
  patientId: String,
  firstName: String,
  lastName: String,
  email: String,
  profile: {
    age: Number,
    gender: String,
  },
  contactInfo: {
    phone: String,
    address: String,
    place: String,
    country: String,
  },
});

const Patient = mongoose.model('Patient', patientSchema);

app.post('/createPatient', async (req, res) => {
  const { patientId, firstName, lastName, email, profile, contactInfo } = req.body;

  try {
    // Provera da li već postoji pacijent sa datim emailom
    const existingPatientEmail = await Patient.findOne({ email: email });
    const existingPatientUsername = await Patient.findOne({ patientId: patientId });

    if (existingPatientEmail) {
      return res.status(400).json({ message: `Patient with email ${email} already exists` });
    }

    if (existingPatientUsername) {
      return res.status(400).json({ message: `Patient with username ${patientId} already exists` });
    }

    // Ako ne postoji, kreira se novi pacijent
    const newPatient = new Patient({
      patientId: patientId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      profile: profile,
      contactInfo: contactInfo,
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/createPatient`);
});