const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3008; // Postavljen drugi port kako bi se izbegli konflikti

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

// Ruta za brisanje radnog vremena terapeuta
app.post('/deleteTherapistWorkTime', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Pronađi dostupnost terapeuta u tabeli therapist_availability
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId: therapistId });

    if (!therapistAvailability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    // Pronađi odgovarajući datum u availability nizu
    let availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (!availabilityEntry) {
      return res.status(404).json({ message: `No availability found for date ${date}` });
    }

    if (time_slots) {
      // Ako su specificirani time_slots, proveri da li postoje pre nego što ih obrišeš
      const nonExistingSlots = time_slots.filter(slotToDelete =>
        !availabilityEntry.time_slots.some(existingSlot =>
          slotToDelete.start === existingSlot.start && slotToDelete.end === existingSlot.end
        )
      );

      if (nonExistingSlots.length > 0) {
        return res.status(404).json({ message: 'One or more time slots do not exist', nonExistingSlots });
      }

      // Obriši postojeće slotove
      availabilityEntry.time_slots = availabilityEntry.time_slots.filter(existingSlot =>
        !time_slots.some(slotToDelete =>
          slotToDelete.start === existingSlot.start && slotToDelete.end === existingSlot.end
        )
      );

      // Ako više nema slotova za taj datum, obriši ceo datum
      if (availabilityEntry.time_slots.length === 0) {
        therapistAvailability.availability = therapistAvailability.availability.filter(entry => entry.date !== date);
      }
    } else {
      // Ako nisu specificirani time_slots, obriši ceo datum
      therapistAvailability.availability = therapistAvailability.availability.filter(entry => entry.date !== date);
    }

    // Sačuvaj promene
    await therapistAvailability.save();

    res.status(200).json({ message: 'Work time deleted successfully', availability: therapistAvailability });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting work time', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/deleteTherapistWorkTime`);
});