// src/modules/job/swagger.js
import { z } from 'zod';
import { jobValidation } from './validation.js';
import { convertZodToOpenApi, createResponseSchema, createPaginatedResponseSchema } from '../../utils/zodToOpenApi.js';

// Convert our Zod schemas to OpenAPI schemas
const jobSchema = convertZodToOpenApi(jobValidation.create);
const jobUpdateSchema = convertZodToOpenApi(jobValidation.update);
const jobResponseSchema = convertZodToOpenApi(createResponseSchema(jobValidation.create));
const jobListResponseSchema = convertZodToOpenApi(createPaginatedResponseSchema(jobValidation.create));

// Define path parameters
const parameters = {
  jobId: {
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$'
    },
    description: 'Job ID'
  }
};

// Define the swagger paths for the job module
const paths = {
  '/jobs': {
    get: {
      tags: ['Jobs'],
      summary: 'Get all jobs',
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1 },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10 },
          description: 'Items per page'
        },
        {
          in: 'query',
          name: 'status',
          schema: { 
            type: 'string',
            enum: ['draft', 'published', 'closed', 'archived']
          },
          description: 'Filter by status'
        },
        {
          in: 'query',
          name: 'sort',
          schema: { type: 'string', default: '-createdAt' },
          description: 'Sort field (prefix with - for descending)'
        },
        // Add more query parameters as needed
      ],
      responses: {
        '200': {
          description: 'List of jobs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobListResponse' }
            }
          }
        }
      }
    },
    post: {
      tags: ['Jobs'],
      summary: 'Create a new job',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Job' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Job created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobResponse' }
            }
          }
        }
      }
    }
  },
  '/jobs/{id}': {
    get: {
      tags: ['Jobs'],
      summary: 'Get a job by ID',
      parameters: [{ $ref: '#/components/parameters/jobId' }],
      responses: {
        '200': {
          description: 'Job details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobResponse' }
            }
          }
        },
        '404': {
          description: 'Job not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Document not found' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Jobs'],
      summary: 'Update a job',
      parameters: [{ $ref: '#/components/parameters/jobId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobUpdate' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Job updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobResponse' }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Jobs'],
      summary: 'Delete a job',
      parameters: [{ $ref: '#/components/parameters/jobId' }],
      responses: {
        '200': {
          description: 'Job deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Deleted successfully' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/jobs/{id}/status': {
    patch: {
      tags: ['Jobs'],
      summary: 'Update job status',
      parameters: [{ $ref: '#/components/parameters/jobId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['draft', 'published', 'closed', 'archived']
                }
              },
              required: ['status']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Status updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobResponse' }
            }
          }
        }
      }
    }
  },
  '/jobs/search': {
    get: {
      tags: ['Jobs'],
      summary: 'Search for jobs',
      parameters: [
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          required: true,
          description: 'Search term'
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1 },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10 },
          description: 'Items per page'
        }
      ],
      responses: {
        '200': {
          description: 'Search results',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobListResponse' }
            }
          }
        }
      }
    }
  }
};

// Define the components (schemas, parameters) for this module
const components = {
  schemas: {
    Job: jobSchema,
    JobUpdate: jobUpdateSchema,
    JobResponse: jobResponseSchema,
    JobListResponse: jobListResponseSchema
  },
  parameters: {
    jobId: parameters.jobId
  }
};

export default {
  paths,
  components
};