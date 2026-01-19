import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget Scanner API',
      version: '1.0.0',
      description: 'API for managing personal budget transactions'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/config/swaggerDocs.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
