import express from 'express';
import { createSubscription } from '../controllers/subscription.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Mock subscription purchase
router.post('/subscribe', protect, createSubscription);

export default router;