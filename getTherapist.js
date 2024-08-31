const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importing CORS package
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3009; // Postavljen drugi port kako bi se izbegli konflikti

app.use(cors()); // Enable CORS
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

// Ruta za dohvaćanje terapeuta po therapistId ili email
app.post('/getTherapist', async (req, res) => {
  const { therapistId, email } = req.body;

  try {
    let therapist;

    if (therapistId) {
      therapist = await Therapist.findOne({ therapistId: therapistId });
      if (!therapist) {
        return res.status(404).json({ message: `No therapist found with ID ${therapistId}` });
      }
    } else if (email) {
      therapist = await Therapist.findOne({ email: email });
      if (!therapist) {
        return res.status(404).json({ message: `No therapist found with email ${email}` });
      }
    } else {
      return res.status(400).json({ message: 'Please provide either therapistId or email' });
    }

    res.status(200).json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapist', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/getTherapist`);
});