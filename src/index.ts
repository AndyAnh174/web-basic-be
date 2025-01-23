import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './routes/auth';
import { submissionRouter } from './routes/submission';
import { userRouter } from './routes/user';
import { initializeDb } from './config/db';

const app = express();
const port = process.env.PORT || 3001;

// Initialize database
initializeDb().catch(console.error);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/submissions', submissionRouter);
app.use('/api/users', userRouter);

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
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
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
        summary: 'Đăng nhập người dùng',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'admin123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          401: {
            description: 'Thông tin đăng nhập không chính xác',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Làm mới access token',
        description: 'Sử dụng refresh token trong cookie để lấy access token mới',
        responses: {
          200: {
            description: 'Làm mới token thành công',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          401: {
            description: 'Refresh token không hợp lệ hoặc hết hạn',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất người dùng',
        description: 'Xóa refresh token khỏi cookie',
        responses: {
          200: {
            description: 'Đăng xuất thành công',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/submissions': {
      get: {
        tags: ['Submissions'],
        summary: 'Lấy danh sách bài nộp (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Danh sách bài nộp',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      userId: { type: 'string' },
                      files: {
                        type: 'object',
                        properties: {
                          html: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              content: { type: 'string' }
                            }
                          },
                          css: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              content: { type: 'string' }
                            }
                          },
                          js: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              content: { type: 'string' }
                            }
                          }
                        }
                      },
                      submittedAt: { type: 'string', format: 'date-time' },
                      status: { type: 'string', enum: ['pending', 'reviewed'] },
                      feedback: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Submissions'],
        summary: 'Tạo bài nộp mới',
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
                      html: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          content: { type: 'string' }
                        }
                      },
                      css: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          content: { type: 'string' }
                        }
                      },
                      js: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          content: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Tạo bài nộp thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    files: {
                      type: 'object',
                      properties: {
                        html: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        },
                        css: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        },
                        js: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        }
                      }
                    },
                    submittedAt: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['pending'] }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/submissions/my-submissions': {
      get: {
        tags: ['Submissions'],
        summary: 'Lấy danh sách bài nộp của người dùng hiện tại',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Danh sách bài nộp',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      userId: { type: 'string' },
                      files: {
                        type: 'object',
                        properties: {
                          html: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              content: { type: 'string' }
                            }
                          },
                          css: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              content: { type: 'string' }
                            }
                          },
                          js: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              content: { type: 'string' }
                            }
                          }
                        }
                      },
                      submittedAt: { type: 'string', format: 'date-time' },
                      status: { type: 'string', enum: ['pending', 'reviewed'] },
                      feedback: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/submissions/{id}': {
      get: {
        tags: ['Submissions'],
        summary: 'Lấy thông tin chi tiết bài nộp',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Thông tin bài nộp',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    files: {
                      type: 'object',
                      properties: {
                        html: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        },
                        css: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        },
                        js: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        }
                      }
                    },
                    submittedAt: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['pending', 'reviewed'] },
                    feedback: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          404: {
            description: 'Không tìm thấy bài nộp',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/submissions/{id}/review': {
      post: {
        tags: ['Submissions'],
        summary: 'Đánh giá bài nộp (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  feedback: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Đánh giá thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    files: {
                      type: 'object',
                      properties: {
                        html: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        },
                        css: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        },
                        js: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            content: { type: 'string' }
                          }
                        }
                      }
                    },
                    submittedAt: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['reviewed'] },
                    feedback: { type: 'string' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          404: {
            description: 'Không tìm thấy bài nộp',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Lấy danh sách người dùng (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Danh sách người dùng',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Tạo người dùng mới (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password', 'role'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'user'] }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Tạo người dùng thành công',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          400: {
            description: 'Username đã tồn tại hoặc thông tin không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Lấy thông tin người dùng (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Thông tin người dùng',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          404: {
            description: 'Không tìm thấy người dùng',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Cập nhật thông tin người dùng (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'user'] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          400: {
            description: 'Username đã tồn tại',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          404: {
            description: 'Không tìm thấy người dùng',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Xóa người dùng (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Xóa người dùng thành công',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          400: {
            description: 'Không thể xóa admin cuối cùng',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          401: {
            description: 'Token không hợp lệ',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          403: {
            description: 'Không có quyền admin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          404: {
            description: 'Không tìm thấy người dùng',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
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