// backend/controllers/buyer.controller.js
import User from '../models/User.js';

/**
 * @desc    Get buyer's dashboard information (e.g., subscription status)
 * @route   GET /api/buyers/dashboard
 * @access  Private (Buyer)
 */
export const getBuyerDashboard = async (req, res, next) => {
  try {
    // The user object is already attached to the request by the `protect` middleware
    // We just need to return the relevant parts
    const user = await User.findById(req.user.id).select('name subscription');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      name: user.name,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
};