// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const version = '1.0.0';

// Import module-specific swagger docs
import jobSwagger from '../modules/job/swagger.js';
import trackerSwagger from '../modules/tracker/swagger.js';
// Import other module swagger docs as your project grows

/**
 * Aggregates swagger definitions from all modules
 * @param {Array} moduleSwaggers - Array of module swagger objects
 * @returns {Object} Combined swagger definition
 */
const aggregateSwagger = (moduleSwaggers) => {
  const paths = {};
  const schemas = {};
  const parameters = {};
  
  moduleSwaggers.forEach(swagger => {
    // Merge paths
    Object.assign(paths, swagger.paths);
    
    // Merge schemas
    Object.assign(schemas, swagger.components?.schemas || {});
    
    // Merge parameters
    Object.assign(parameters, swagger.components?.parameters || {});
  });
  
  return { paths, components: { schemas, parameters } };
};

// Aggregate all module swagger docs
const aggregated = aggregateSwagger([
  jobSwagger,
  trackerSwagger,
  // Add other module swagger objects here
]);

// Create the swagger specification
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API Documentation',
    version,
    description: 'Documentation for the Express API',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    }
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  tags: [
    {
      name: 'Jobs',
      description: 'Job management endpoints'
    },
    {
      name: 'Trackers',
      description: 'Tracker management endpoints'
    },
    // Add more tags as you add more modules
  ],
  ...aggregated,
  components: {
    ...aggregated.components,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Create setup function
const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
  
  // Serve swagger JSON 
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDefinition);
  });
  
  console.log('✅ Swagger documentation available at /api-docs');
};

export default setupSwagger;