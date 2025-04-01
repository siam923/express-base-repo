// modules/job/routes.js
import express from 'express';
import jobController from './controller.js';
import { validate } from '#src/common/middlewares/validate.js';
import { jobValidation } from './validation.js';
import { z } from 'zod';


const router = express.Router();

// Public routes
router.get('/', validate({ query: jobValidation.query }), jobController.getAll);
router.get('/search', jobController.searchJobs);
router.get('/:id', validate({ params: jobValidation.getById }), jobController.getById);
router.get('/status/:status', jobController.getByStatus);

// Protected routes
router.post(
  '/',
  validate({ body: jobValidation.create }),
  jobController.create
);

router.put(
  '/:id',
  validate({ 
    params: jobValidation.getById,
    body: jobValidation.update 
  }),
  jobController.update
);

router.patch(
  '/:id/status',
  validate({ 
    params: jobValidation.getById,
    body: z.object({ status: z.enum(['draft', 'published', 'closed', 'archived']) })
  }),
  jobController.changeStatus
);

router.delete(
  '/:id',
  validate({ params: jobValidation.getById }),
  jobController.delete
);

export default router;