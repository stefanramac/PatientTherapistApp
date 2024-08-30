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

app.get('/getUsers', async (req, res) => {
  const { type } = req.query;

  try {
    let users;
    
    if (type) {
      users = await User.find({ type: type });
    } else {
      users = await User.find();
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/getUsers`);
});
