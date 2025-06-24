const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', authRoutes);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));

require('dotenv').config();

const messageRoutes = require('./messages');
app.use('/', messageRoutes);
