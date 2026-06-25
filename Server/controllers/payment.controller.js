import Payment from "../models/payment.model.js";
import razorpay from "../services/razorpay.services.js";
import crypto from "crypto";
import User from "../models/user.model.js";

const PLAN_CONFIG = {
  standard: {
    planId: "standard",
    name: "Standard Plan",
    amount: 99,
    credits: 150,
  },
  premium: {
    planId: "premium",
    name: "Premium Plan",
    amount: 499,
    credits: 650,
  },
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = PLAN_CONFIG[planId];

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const options = {
      amount: plan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: String(req.userId),
        planId: plan.planId,
        credits: String(plan.credits),
      },
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId: plan.planId,
      amount: plan.amount,
      credits: plan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(200).json({
      success: true,
      order,
      plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment fields",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.status === "paid") {
      const user = await User.findById(req.userId);

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        user,
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    await payment.save();

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: {
          credits: payment.credits,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify Razorpay payment",
      error: error.message,
    });
  }
};