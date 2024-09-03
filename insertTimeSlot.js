const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importing CORS package
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3006; // Postavljen drugi port kako bi se izbegli konflikti

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

const Availability = mongoose.model('Availability', availabilitySchema, 'therapist_unavailability');
const TherapistAvailability = mongoose.model('TherapistAvailability', therapistAvailabilitySchema, 'therapist_availability');

// Ruta za dodavanje ili ažuriranje vremenskih slotova za terapeuta
app.post('/insertTimeSlot', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Pronađi dostupnost terapeuta u tabeli therapist_availability
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId: therapistId });

    if (!therapistAvailability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    // Pronađi odgovarajući datum u availability nizu
    const availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (!availabilityEntry) {
      return res.status(400).json({ message: `Therapist is not available on date ${date}` });
    }

    // Proveri da li svi novi time_slots postoje u dostupnosti terapeuta za taj dan
    const isAvailable = time_slots.every(newSlot =>
      availabilityEntry.time_slots.some(availableSlot =>
        newSlot.start >= availableSlot.start && newSlot.end <= availableSlot.end
      )
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'One or more time slots are not within the therapist’s availability.' });
    }

    // Provera da li već postoji unavailability dokument za therapistId
    const unavailability = await Availability.findOne({ therapistId: therapistId });

    if (!unavailability) {
      return res.status(404).json({ message: `No unavailability found for therapist with ID ${therapistId}` });
    }

    // Pronađi odgovarajući datum u unavailability nizu
    const dateEntry = unavailability.unavailability.find(entry => entry.date === date);

    if (dateEntry) {
      // Proveri da li postoji duplikat vremenskog slota
      const duplicateSlots = dateEntry.time_slots.filter(slot =>
        time_slots.some(newSlot => newSlot.start === slot.start && newSlot.end === slot.end)
      );

      if (duplicateSlots.length > 0) {
        return res.status(400).json({ message: 'Duplicate time slots found for the same date.' });
      }

      // Dodaj nove time_slots ako nema duplikata
      dateEntry.time_slots.push(...time_slots);
    } else {
      // Ako datum ne postoji, dodaj novi datum sa time_slots
      unavailability.unavailability.push({ date: date, time_slots: time_slots });
    }

    // Sačuvaj promene
    await unavailability.save();

    res.status(200).json({ message: 'Time slots updated successfully', unavailability: unavailability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating time slots', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/insertTimeSlot`);
});