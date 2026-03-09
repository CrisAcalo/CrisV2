const swaggerJsdocLib = require('swagger-jsdoc');
const swaggerJsdoc = swaggerJsdocLib.default || swaggerJsdocLib;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Portfolio Backend API',
            version: '1.0.0',
            description: 'API RESTful para el portafolio y dashboard de administración.',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Servidor local de desarrollo',
            },
            // Añadir la URL de producción o staging según sea necesario
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./src/infrastructure/web/routes/*.ts'], // Archivos que contienen anotaciones de swagger
};

export const swaggerSpec = swaggerJsdoc(options);
