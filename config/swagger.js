const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const port = process.env.PORT || 5000;
const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

console.log(`Swagger configured to use server URL: ${serverUrl}`);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DarthTator',
      version: '1.0.0',
      description: 'API Documentation for DarthTator',
    },
    servers: [
      {
        url: serverUrl,
        description: 'API Server',
      },
    ],
  },
  apis: ['./routes/*.js', './server.js', './app.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
  );
};