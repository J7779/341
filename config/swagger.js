const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const port = process.env.PORT || 5000;
// Use API_URL from .env if available, otherwise fallback to localhost or Render URL
const serverUrl = process.env.API_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

console.log(`Swagger configured to use server URL: ${serverUrl}`);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DarthTator API with OAuth',
      version: '1.0.0',
      description: 'API Documentation for DarthTator, now with Google OAuth2 and JWT security.',
    },
    servers: [
      {
        url: serverUrl, // Use the dynamically determined server URL
        description: 'API Server',
      },
    ],
    components: { // Global components definition
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
        // If you were using session cookies for some auth:
        // cookieAuth: {
        //   type: 'apiKey',
        //   in: 'cookie',
        //   name: 'connect.sid' // Or whatever your session cookie name is
        // }
      },
      schemas: { // Centralized schemas (can also be defined in route files)
        Product: { /* ... your Product schema ... */ },
        Contact: { /* ... your Contact schema ... */ },
        User: { // User schema for auth responses
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User MongoDB ID' },
            googleId: { type: 'string', description: 'User Google ID' },
            displayName: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
          }
        }
      }
    },
    // security: [ // You can define global security, but often it's better per-route
    //   {
    //     bearerAuth: [] // Makes all routes require bearerAuth unless overridden
    //   }
    // ]
  },
  // Path to the API docs (your route files)
  apis: ['./routes/*.js', './app.js'], // Make sure this includes all files with Swagger annotations
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      // You can also define swaggerOptions here
      // swaggerOptions: {
      //   persistAuthorization: true, // Persist authorization in Swagger UI
      // }
    })
  );
};