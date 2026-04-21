const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
