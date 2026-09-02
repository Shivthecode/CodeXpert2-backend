const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS force karna

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file ko read karne ke liye

// Routes import kar rahe hain
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teamRoutes'); 
const taskRoutes = require('./routes/tasks'); 
const noticeRoutes = require('./routes/noticeRoutes'); // 🔴 Naya Notice Route Import Kiya

// Server setup
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Database successfully connected!");
  })
  .catch((error) => {
    console.log("Database connection failed:", error);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/notices', noticeRoutes); // 🔴 Naya Notice Route Server Se Jod Diya

// Test Route
app.get('/', (req, res) => {
  res.send("CodeXpert Backend Server chal raha hai!");
});

// Server ko port 5000 par start karna
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});