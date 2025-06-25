const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');

const app = express();

const corsOptions = {
  origin: 'https://your-frontend-url.onrender.com', // replace with your actual frontend Render URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', authRoutes);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));

require('dotenv').config();

const messageRoutes = require('./messages');
app.use('/', messageRoutes);
