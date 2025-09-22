import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected, a user must be logged in
router.use(protect);

// Route to create a new Razorpay order
router.post('/create-order', createOrder);

// Route to verify the payment after it's completed on the frontend
router.post('/verify-payment', verifyPayment);

export default router;