// src/common/middlewares/validate.js

import { ZodError } from 'zod';
import createError from 'http-errors';

/**
 * Validate middleware to handle body, query, and params using Zod schemas.
 * @param {Object} schemas - An object containing Zod schemas for body, query, and/or params.
 * @param {ZodSchema} schemas.body - Schema to validate req.body.
 * @param {ZodSchema} schemas.query - Schema to validate req.query.
 * @param {ZodSchema} schemas.params - Schema to validate req.params.
 * @returns Express middleware function.
 */
export const validate = ({ body, query, params }) => (req, res, next) => {
  try {
    if (body) {
      const parsedBody = body.safeParse(req.body);
      if (!parsedBody.success) {
        throw parsedBody.error;
      }
      req.body = parsedBody.data;
    }

    if (query) {
      const parsedQuery = query.safeParse(req.query);
      if (!parsedQuery.success) {
        throw parsedQuery.error;
      }
      req.query = parsedQuery.data;
    }

    if (params) {
      const parsedParams = params.safeParse(req.params);
      if (!parsedParams.success) {
        throw parsedParams.error;
      }
      req.params = parsedParams.data;
    }

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        createError(
          400,
          err.errors.map((e) => e.message).join(', ')
        )
      );
    }
    next(err);
  }
};