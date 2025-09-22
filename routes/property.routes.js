import express from 'express';
import {
  getProperties,
  getMyListings,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/property.controller.js';
import { protect, hasRole, isPremium } from '../middlewares/auth.middleware.js';
import { uploadPropertyFiles } from '../middlewares/upload.middleware.js';

const router = express.Router();

// --- CHANGE: This route now supports filtering, sorting, and pagination ---
// Example: /api/properties?location=Begusarai&maxPrice=5000000&sortBy=price:desc&page=1&limit=10
router.get('/', getProperties);

// Route for Sellers to see their own listings
router.get('/my-listings', protect, hasRole('seller', 'admin'), getMyListings);

// Route to get full property details (requires premium)
router.get('/:id', protect, isPremium, getPropertyById);

// Seller routes to manage their properties
router.post(
  '/',
  protect,
  hasRole('seller', 'admin'),
  uploadPropertyFiles,
  createProperty
);

router.put('/:id', protect, hasRole('seller', 'admin'), updateProperty);
router.delete('/:id', protect, hasRole('seller', 'admin'), deleteProperty);

export default router;