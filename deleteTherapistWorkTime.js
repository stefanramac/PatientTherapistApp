const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importing CORS package
const config = require('./config'); // Importing config file

const app = express();
const port = 3008; // Assigned port to avoid conflicts

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

// Defining the schema for therapist availability
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

// Route for deleting therapist work time
app.delete('/deleteTherapistWorkTime', async (req, res) => {
  const { therapistId, date, time_slots } = req.body;

  try {
    // Find therapist availability in the therapist_availability table
    const therapistAvailability = await TherapistAvailability.findOne({ therapistId: therapistId });

    if (!therapistAvailability) {
      return res.status(404).json({ message: `No availability found for therapist with ID ${therapistId}` });
    }

    // Find the corresponding date in the availability array
    let availabilityEntry = therapistAvailability.availability.find(entry => entry.date === date);

    if (!availabilityEntry) {
      return res.status(404).json({ message: `No availability found for date ${date}` });
    }

    if (time_slots) {
      // If time_slots are specified, check if they exist before deleting them
      const nonExistingSlots = time_slots.filter(slotToDelete =>
        !availabilityEntry.time_slots.some(existingSlot =>
          slotToDelete.start === existingSlot.start && slotToDelete.end === existingSlot.end
        )
      );

      if (nonExistingSlots.length > 0) {
        return res.status(404).json({ message: 'One or more time slots do not exist', nonExistingSlots });
      }

      // Delete existing slots
      availabilityEntry.time_slots = availabilityEntry.time_slots.filter(existingSlot =>
        !time_slots.some(slotToDelete =>
          slotToDelete.start === existingSlot.start && slotToDelete.end === existingSlot.end
        )
      );

      // If there are no more slots for that date, delete the entire date
      if (availabilityEntry.time_slots.length === 0) {
        therapistAvailability.availability = therapistAvailability.availability.filter(entry => entry.date !== date);
      }
    } else {
      // If time_slots are not specified, delete the entire date
      therapistAvailability.availability = therapistAvailability.availability.filter(entry => entry.date !== date);
    }

    // Save changes
    await therapistAvailability.save();

    res.status(200).json({ message: 'Work time deleted successfully', availability: therapistAvailability });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting work time', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/deleteTherapistWorkTime`);
});