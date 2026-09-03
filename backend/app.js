require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables!');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    console.error('Connexion à MongoDB échouée !', error);
  }
};

// Initial connection
connectDB();

const app = express();

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;