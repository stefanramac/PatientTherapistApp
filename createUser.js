const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config'); // Uvoz config fajla

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  type: String,
  firstName: String,
  lastName: String,
  email: String,
  age: Number,
});

const User = mongoose.model('User', userSchema);

app.post('/createUser', async (req, res) => {
  const { type, firstName, lastName, email, age } = req.body;

  try {
    // Provera da li već postoji korisnik sa datim emailom
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ message: `User with email ${email} already exists` });
    }

    // Ako ne postoji, kreira se novi korisnik
    const newUser = new User({
      type: type,
      firstName: firstName,
      lastName: lastName,
      email: email,
      age: age,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});