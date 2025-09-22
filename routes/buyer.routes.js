// backend/routes/buyer.routes.js
import express from 'express';
import { getBuyerDashboard } from '../controllers/buyer.controller.js';
import { protect, hasRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes here are protected and for buyers only
router.use(protect, hasRole('buyer'));

router.get('/dashboard', getBuyerDashboard);

export default router;