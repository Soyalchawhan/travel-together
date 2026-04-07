const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://travel-together-lovat.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/match', require('./routes/match'));
app.use('/api/messages', require('./routes/messages'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'TravelTogether API running' }));

// Socket.IO real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinTrip', (tripId) => {
    socket.join(tripId);
    console.log(`Socket ${socket.id} joined trip room: ${tripId}`);
  });

  socket.on('sendMessage', (data) => {
    // Broadcast to everyone in the room except sender
    socket.to(data.tripId).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-planner';
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
