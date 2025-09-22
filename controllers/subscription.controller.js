import User from '../models/User.js';

// @desc    Create a mock subscription
// @route   POST /api/subscriptions/subscribe
// @access  Private
const createSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // In a real app, you'd integrate a payment gateway like Stripe or Razorpay here.
        // For this mock, we just set the subscription to 'pending' for admin approval.
        user.subscription = {
            plan: 'premium',
            status: 'pending', // Admin must approve this
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year validity
        };

        await user.save();

        res.json({
            message: 'Subscription request sent successfully. Waiting for admin approval.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscription: user.subscription
            }
        });
    } catch (error) {
        next(error);
    }
};

// This would be an admin function, but for simplicity, we'll let admins approve via an admin panel.
// A real app might have webhooks from the payment gateway to auto-activate subscriptions.

export { createSubscription };