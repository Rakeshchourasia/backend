import User from '../models/User.js';
import Property from '../models/Property.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ 'subscription.status': 'active' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const approvedProperties = await Property.countDocuments({ status: 'approved' });

    res.json({ totalUsers, premiumUsers, pendingProperties, approvedProperties });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all pending properties
 * @route   GET /api/admin/properties/pending
 * @access  Private (admin)
 */
const getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: 'pending' }).populate('seller', 'name email');
    res.json(properties);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a property
 * @route   PATCH /api/admin/properties/:id/approve
 * @access  Private (admin)
 */
const approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (property) {
      property.status = 'approved';
      await property.save();
      res.json({ message: 'Property approved' });
    } else {
      res.status(404);
      throw new Error('Property not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a property
 * @route   PATCH /api/admin/properties/:id/reject
 * @access  Private (admin)
 */
const rejectProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (property) {
      property.status = 'rejected';
      await property.save();
      res.json({ message: 'Property rejected' });
    } else {
      res.status(404);
      throw new Error('Property not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full details of any property for an admin
 * @route   GET /api/admin/properties/:id
 * @access  Private (Admin)
 */
const getPropertyDetailsForAdmin = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'name email');
    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }
    res.json(property); // Return full property details
  } catch (error) {
    next(error);
  }
};

// --- Single, consolidated export statement ---
export { 
  getDashboardStats, 
  getPendingProperties, 
  approveProperty, 
  rejectProperty, 
  getAllUsers, 
  getPropertyDetailsForAdmin 
};