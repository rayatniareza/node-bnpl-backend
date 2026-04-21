require('dotenv').config();
const app = require('./app');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const PORT = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Identity Service is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
