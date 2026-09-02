const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS force karna

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // 🔴 HTTP Server wrap karne ke liye
const { Server } = require('socket.io'); // 🔴 Socket.io import kiya
require('dotenv').config(); // .env file ko read karne ke liye

// Routes import kar rahe hain
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teamRoutes'); 
const taskRoutes = require('./routes/tasks'); 
const noticeRoutes = require('./routes/noticeRoutes'); 

// Server setup
const app = express();
const server = http.createServer(app); // 🔴 Express app ko HTTP server mein wrap kiya
const io = new Server(server, {
  cors: { origin: "*" }
}); // 🔴 Socket.io setup

// Middleware to make 'io' accessible inside controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

// Socket.io connection listener
io.on('connection', (socket) => {
  console.log('A user connected via socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/notices', noticeRoutes); 

// Test Route
app.get('/', (req, res) => {
  res.send("CodeXpert Backend Server chal raha hai!");
});

// Server ko port 5000 par start karna (app.listen ki jagah server.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});