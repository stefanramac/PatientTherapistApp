const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3000; // Postavljen drugi port kako bi se izbegli konflikti

app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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

const Availability = mongoose.model('Availability', availabilitySchema, 'therapist_availability');

// Ruta za dodavanje ili ažuriranje vremenskih slotova za terapeuta
app.post('/insertTimeSlot', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Pronađi dokument sa odgovarajućim therapistId
    const availability = await Availability.findOne({ therapistId: therapistId });

    if (!availability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    // Pronađi odgovarajući datum u unavailability nizu
    const dateEntry = availability.unavailability.find(entry => entry.date === date);

    if (dateEntry) {
      // Provera da li postoji već isti vremenski slot za isti dan
      const duplicateSlots = dateEntry.time_slots.filter(slot =>
        time_slots.some(newSlot => newSlot.start === slot.start && newSlot.end === slot.end)
      );

      if (duplicateSlots.length > 0) {
        return res.status(400).json({ message: 'Duplicate time slots found for the same date.' });
      }

      // Ako ne postoji duplikat, dodaj nove time_slots u postojeći niz time_slots
      dateEntry.time_slots.push(...time_slots);
    } else {
      // Ako datum ne postoji, dodaj novi datum sa time_slots
      availability.unavailability.push({ date: date, time_slots: time_slots });
    }

    // Sačuvaj promene
    await availability.save();

    res.status(200).json({ message: 'Time slots updated successfully', availability: availability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating time slots', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/insertTimeSlot`);
});