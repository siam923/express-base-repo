// src/utils/zodToOpenApi.js
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Converts Zod schemas to OpenAPI-compatible JSON schemas
 * @param {Object} zodSchema - The Zod schema object
 * @returns {Object} OpenAPI-compatible schema
 */
export const convertZodToOpenApi = (zodSchema) => {
  return zodToJsonSchema(zodSchema, {
    $refStrategy: 'manual',
    definitionPath: 'components/schemas'
  });
};

/**
 * Creates a standard API response schema
 * @param {Object} dataSchema - Schema for the data property
 * @returns {Object} Response schema with success and data properties
 */
export const createResponseSchema = (dataSchema) => {
  return z.object({
    success: z.boolean().default(true),
    data: dataSchema
  });
};

/**
 * Creates a standard paginated response schema
 * @param {Object} itemSchema - Schema for individual items in docs array
 * @returns {Object} Paginated response schema
 */
export const createPaginatedResponseSchema = (itemSchema) => {
  return z.object({
    success: z.boolean().default(true),
    docs: z.array(itemSchema),
    totalDocs: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    page: z.number(),
    pagingCounter: z.number(),
    hasPrevPage: z.boolean(),
    hasNextPage: z.boolean(),
    prevPage: z.number().nullable(),
    nextPage: z.number().nullable()
  });
};