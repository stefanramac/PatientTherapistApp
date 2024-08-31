const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3004; // Postavljen drugi port kako bi se izbegli konflikti

app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: {
    w: "majority",
    wtimeout: 1000
  }
});

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Definisanje šeme za pacijente (ponovo koristiti istu šemu)
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

// Ruta za dohvaćanje svih pacijenata
app.get('/getPatients', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/getPatients`);
});