const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');

const options = {
    definition: {
      openapi: '3.0.1',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Documentación ecommerce Distrimax',
      },
    },
    apis: ["./src/docs/**/*.yaml"]
  };

  const swaggerSpec = swaggerJsdoc(options);

  module.exports = {
    serve: swaggerUiExpress.serve,
    setup: swaggerUiExpress.setup(swaggerSpec),
  };
