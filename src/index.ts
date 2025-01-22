import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './routes/auth';
import { submissionRouter } from './routes/submission';
import { initializeDb } from './config/db';

const app = express();
const port = process.env.PORT || 3001;

// Initialize database
initializeDb().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/submissions', submissionRouter);

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Web Contest API',
    version: '1.0.0',
    description: 'API documentation for Web Contest application'
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful'
          }
        }
      }
    },
    '/api/submissions': {
      get: {
        tags: ['Submissions'],
        summary: 'Get all submissions (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of all submissions'
          }
        }
      },
      post: {
        tags: ['Submissions'],
        summary: 'Create new submission',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  files: {
                    type: 'object',
                    properties: {
                      html: { type: 'string' },
                      css: { type: 'string' },
                      js: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Submission created successfully'
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
}); 