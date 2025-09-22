import express from 'express';
import { 
  getDashboardStats, 
  getPendingProperties, 
  approveProperty, 
  rejectProperty,
  getAllUsers,
  getPropertyDetailsForAdmin, // --- ADD THIS IMPORT ---
} from '../controllers/admin.controller.js';
import { protect, hasRole } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, hasRole('admin'));

// Property Management
router.get('/dashboard-stats', getDashboardStats);
router.get('/properties/pending', getPendingProperties);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/reject', rejectProperty);
router.get('/properties/:id', getPropertyDetailsForAdmin); // --- ADD THIS NEW ROUTE ---

// User Management
router.get('/users', getAllUsers);

// The subscription approval route is now removed.

export default router;