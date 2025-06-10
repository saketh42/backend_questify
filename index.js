const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routers/users');
const dailyTaskRoutes = require('./routers/dailyTasks');
const geminiRoutes = require('./routers/gemini');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/dailyTasks', dailyTaskRoutes);
app.use('/api/gemini', geminiRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/questify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
