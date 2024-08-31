const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3003; // Postavljen drugi port kako bi se izbegli konflikti

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

// Ruta za brisanje vremenskih slotova za terapeuta
app.post('/deleteTimeSlot', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Pronađi unavailability dokument za therapistId
    const unavailability = await Availability.findOne({ therapistId: therapistId });

    if (!unavailability) {
      return res.status(404).json({ message: `No unavailability found for therapist with ID ${therapistId}` });
    }

    // Pronađi odgovarajući datum u unavailability nizu
    const dateEntry = unavailability.unavailability.find(entry => entry.date === date);

    if (!dateEntry) {
      return res.status(404).json({ message: `No unavailability found for therapist on date ${date}` });
    }

    if (!time_slots || time_slots.length === 0) {
      // Ako nema time_slots u requestu, obriši ceo datum
      unavailability.unavailability = unavailability.unavailability.filter(entry => entry.date !== date);
    } else {
      // Proveri da li postoje time_slots koji odgovaraju onima u requestu
      const slotsToDelete = time_slots.filter(newSlot =>
        dateEntry.time_slots.some(slot => slot.start === newSlot.start && slot.end === newSlot.end)
      );

      if (slotsToDelete.length === 0) {
        return res.status(404).json({ message: 'The specified time slots do not exist in the database.' });
      }

      // Ukloni pronađene slotove
      dateEntry.time_slots = dateEntry.time_slots.filter(slot =>
        !slotsToDelete.some(deleteSlot => deleteSlot.start === slot.start && deleteSlot.end === slot.end)
      );

      // Ako su svi slotovi za određeni datum izbrisani, ukloni ceo datum
      if (dateEntry.time_slots.length === 0) {
        unavailability.unavailability = unavailability.unavailability.filter(entry => entry.date !== date);
      }
    }

    // Sačuvaj promene
    await unavailability.save();

    res.status(200).json({ message: 'Time slots deleted successfully', unavailability: unavailability });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time slots', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/deleteTimeSlot`);
});