// server.js
const express = require('express');
const connectDB = require('./db'); // Import the database connection function
const cors = require('cors'); // Import cors middleware
require('dotenv').config(); // Load environment variables

const app = express();

// Connect to Database
connectDB();

// Init Middleware
// Allows us to get data in req.body
app.use(express.json({ extended: false }));

// Enable CORS for all routes
// This is crucial for allowing your frontend (running on a different port/origin)
// to make requests to your backend.
app.use(cors());

// Define Routes
app.get('/', (req, res) => res.send('API Running')); // Simple test route

// Use the tasks API routes
app.use('/api/tasks', require('./routes/tasks'));

// Set the port for the server, default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
