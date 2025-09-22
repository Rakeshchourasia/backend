import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    // Debug logs to confirm env vars
    console.log("👉 RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log(
      "👉 RAZORPAY_KEY_SECRET:",
      process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Missing"
    );

    // Initialize Razorpay instance inside function to avoid undefined issue
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 4999 * 100, // Amount in paise (₹4999.00)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      res.status(500);
      throw new Error("Failed to create Razorpay order");
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment and update user subscription
 * @route   POST /api/payment/verify-payment
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // 1. Create the signature string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // 2. Generate the expected signature using your secret key
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // 3. Compare the signatures
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is authentic, now update the user's subscription
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Set subscription to 'pending' for admin approval
      user.subscription = {
        plan: "premium",
        status: "active", // Admin must approve this
        startDate: new Date(),
        endDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ), // 1 year validity
        paymentId: razorpay_payment_id,
      };

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Payment successful! Your subscription is pending admin approval.",
      });
    } else {
      res.status(400);
      throw new Error("Payment verification failed. Invalid signature.");
    }
  } catch (error) {
    next(error);
  }
};
