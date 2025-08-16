const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const { authenticateToken } = require('./middleware/auth');
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/conversations', authenticateToken, conversationRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', async (token) => {
    try {
      // Verify token and get user
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (user) {
        socket.userId = user.id;
        socket.username = user.username;
        connectedUsers.set(user.id, socket.id);
        
        // Update user status to online
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'online', lastSeen: new Date() }
        });

        // Notify other users
        socket.broadcast.emit('userStatusChanged', {
          userId: user.id,
          status: 'online'
        });

        console.log(`User ${user.username} authenticated and connected`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authError', 'Authentication failed');
    }
  });

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User left conversation: ${conversationId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, content, type = 'text' } = data;
      
      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          type,
          senderId: socket.userId,
          conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      });

      // Emit message to all users in the conversation
      io.to(conversationId).emit('newMessage', message);

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', 'Failed to send message');
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('userTyping', {
      userId: socket.userId,
      username: socket.username,
      conversationId: data.conversationId
    });
  });

  socket.on('stopTyping', (data) => {
    socket.to(data.conversationId).emit('userStopTyping', {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      
      // Update user status to offline
      await prisma.user.update({
        where: { id: socket.userId },
        data: { status: 'offline', lastSeen: new Date() }
      });

      // Notify other users
      socket.broadcast.emit('userStatusChanged', {
        userId: socket.userId,
        status: 'offline'
      });

      console.log(`User ${socket.username} disconnected`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
}); 

const path = require('path')

// Serve React static files
app.use(express.static(path.join(__dirname, '../client/dist')))

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})
