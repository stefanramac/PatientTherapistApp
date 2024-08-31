const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3007; // Postavljen drugi port kako bi se izbegli konflikti

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

const TherapistAvailability = mongoose.model('TherapistAvailability', therapistAvailabilitySchema, 'therapist_availability');

// Ruta za dodavanje radnog vremena terapeuta
app.post('/insertTherapistWorkTime', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Pronađi dostupnost terapeuta u tabeli therapist_availability
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId: therapistId });

    if (!therapistAvailability) {
      // Ako nema podataka za tog terapeuta, kreiraj novi unos
      const newAvailability = new TherapistAvailability({
        therapistId,
        availability: [{ date, time_slots }]
      });
      await newAvailability.save();
      return res.status(201).json({ message: 'Work time added successfully', availability: newAvailability });
    }

    // Pronađi odgovarajući datum u availability nizu
    let availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (availabilityEntry) {
      // Proveri da li postoje preklapajući slotovi
      const overlappingSlots = availabilityEntry.time_slots.filter(existingSlot =>
        time_slots.some(newSlot =>
          (newSlot.start < existingSlot.end && newSlot.end > existingSlot.start)
        )
      );

      if (overlappingSlots.length > 0) {
        return res.status(400).json({ message: 'Conflicting time slots found', overlappingSlots });
      }

      // Dodaj nove slotove ako nema preklapanja
      availabilityEntry.time_slots.push(...time_slots);
    } else {
      // Ako datum ne postoji, dodaj novi datum sa time_slots
      therapistAvailability.availability.push({ date: date, time_slots: time_slots });
    }

    // Sačuvaj promene
    await therapistAvailability.save();

    res.status(200).json({ message: 'Work time added successfully', availability: therapistAvailability });
  } catch (error) {
    res.status(500).json({ message: 'Error adding work time', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/insertTherapistWorkTime`);
});