const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Importing config file

const app = express();
const port = 3003; // Assigned port to avoid conflicts

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

// Defining the schema for therapist availability
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

// Route for deleting time slots for a therapist
app.delete('/deleteTimeSlot', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Find the unavailability document for the therapistId
    const unavailability = await Availability.findOne({ therapistId: therapistId });

    if (!unavailability) {
      return res.status(404).json({ message: `No unavailability found for therapist with ID ${therapistId}` });
    }

    // Find the corresponding date in the unavailability array
    const dateEntry = unavailability.unavailability.find(entry => entry.date === date);

    if (!dateEntry) {
      return res.status(404).json({ message: `No unavailability found for therapist on date ${date}` });
    }

    if (!time_slots || time_slots.length === 0) {
      // If no time_slots are provided in the request, delete the entire date
      unavailability.unavailability = unavailability.unavailability.filter(entry => entry.date !== date);
    } else {
      // Check if the time slots exist in the database
      const slotsToDelete = time_slots.filter(newSlot =>
        dateEntry.time_slots.some(slot => slot.start === newSlot.start && slot.end === newSlot.end)
      );

      if (slotsToDelete.length === 0) {
        return res.status(404).json({ message: 'The specified time slots do not exist in the database.' });
      }

      // Remove the found slots
      dateEntry.time_slots = dateEntry.time_slots.filter(slot =>
        !slotsToDelete.some(deleteSlot => deleteSlot.start === slot.start && deleteSlot.end === slot.end)
      );

      // If all slots for a given date are deleted, remove the entire date
      if (dateEntry.time_slots.length === 0) {
        unavailability.unavailability = unavailability.unavailability.filter(entry => entry.date !== date);
      }
    }

    // Save the changes
    await unavailability.save();

    res.status(200).json({ message: 'Time slots deleted successfully', unavailability: unavailability });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time slots', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/deleteTimeSlot`);
});