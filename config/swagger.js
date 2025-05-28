const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const port = process.env.PORT || 5000;
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
        url: serverUrl,
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token. You can get one by logging in via Google and it will be displayed on the home page.',
        },
      },
      schemas: {
        Product: {
            type: 'object',
            properties: {
                // ... your Product schema properties
            }
         },
        Contact: {
            type: 'object',
            properties: {
                // ... your Contact schema properties
            }
        },
        User: {
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
  },
  apis: ['./routes/*.js', './app.js'],
};

const specs = swaggerJsdoc(options);

const swaggerUiAuthScript = `
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { // Delay to ensure Swagger UI is initialized
        const ui = window.ui;
        if (ui) {
          const params = new URLSearchParams(window.location.search);
          const token = params.get('token');
          if (token) {
            console.log('Swagger Script: Token found in URL (raw):', token);
   
            ui.preauthorizeApiKey("bearerAuth", token);
          } else {
            const storedAuth = localStorage.getItem('swaggerEditor');
            if (storedAuth) {
                try {
                    const parsedAuth = JSON.parse(storedAuth);
                    if (parsedAuth && parsedAuth.auth && parsedAuth.auth.bearerAuth && parsedAuth.auth.bearerAuth.value) {
                         console.log('Swagger Script: Token found in localStorage:', parsedAuth.auth.bearerAuth.value);
                         let localStorageToken = parsedAuth.auth.bearerAuth.value;
                         if (localStorageToken.toLowerCase().startsWith('bearer ')) {
                            ui.preauthorizeApiKey("bearerAuth", localStorageToken); 
                         } else {
                            ui.preauthorizeApiKey("bearerAuth", "Bearer " + localStorageToken); 
                         }
                    }
                } catch (e) { console.error('Error parsing stored Swagger auth:', e); }
            }
          }
        }
      }, 1000);
    });
  </script>
`;

module.exports = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,

    (req, res) => {

      const html = swaggerUi.generateHTML(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "DarthTator API Docs",
      });

      res.send(html.replace('</body>', swaggerUiAuthScript + '</body>'));
    }
  );
};