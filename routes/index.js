// src/routes/index.js
import express from 'express';
import authRoutes from "./auth.js"
import jobRoutes from '#src/modules/job/routes.js';

const router = express.Router();

router.use('/auth', authRoutes)
router.use('/jobs', jobRoutes);


export default router;
