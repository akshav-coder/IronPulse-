import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey1234',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocksecret1234',
});

// @desc    Add a payment record
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const {
      member_id,
      amount,
      payment_date,
      due_date,
      status,
      payment_method,
      plan_id,
    } = req.body;

    if (!member_id || amount === undefined || !due_date || !payment_method) {
      res.status(400);
      throw new Error('Please fill in required fields (member_id, amount, due_date, payment_method)');
    }

    // Verify member exists
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    const payment = await Payment.create({
      member_id,
      gym_id: member.gym_id,
      amount: Number(amount),
      payment_date: payment_date || Date.now(),
      due_date,
      status: status || 'pending',
      payment_method,
      plan_id: plan_id || null,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'name email phone' },
      });

    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get payment history for a member
// @route   GET /api/payments/member/:member_id
// @access  Private
export const getMemberPaymentHistory = async (req, res) => {
  try {
    const history = await Payment.find({ member_id: req.params.member_id })
      .sort({ due_date: -1 })
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'name email phone' },
      });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments for a gym
// @route   GET /api/payments/gym/:gym_id
// @access  Private
export const getGymPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ gym_id: req.params.gym_id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'name email phone' },
      });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, payment_method, payment_date } = req.body;

    if (!status) {
      res.status(400);
      throw new Error('Payment status is required');
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    payment.status = status;
    if (payment_method) payment.payment_method = payment_method;
    if (payment_date) payment.payment_date = payment_date;

    const updatedPayment = await payment.save();

    const populatedPayment = await Payment.findById(updatedPayment._id)
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'name email phone' },
      });

    res.json(populatedPayment);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order (for generic unpaid invoices)
// @route   POST /api/payments/:id/razorpay-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      res.status(404);
      throw new Error('Payment invoice not found');
    }

    if (payment.status === 'paid') {
      res.status(400);
      throw new Error('Invoice is already paid');
    }

    const options = {
      amount: Math.round(payment.amount * 100), // in paise
      currency: 'INR',
      receipt: payment._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey1234',
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_id) {
      res.status(400);
      throw new Error('Missing signature verification tokens');
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mocksecret1234');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error('Payment signature mismatch. Transaction failed.');
    }

    // Find and update payment status to paid
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      res.status(404);
      throw new Error('Payment invoice not found');
    }

    payment.status = 'paid';
    payment.payment_method = 'razorpay';
    payment.payment_date = new Date();
    payment.razorpay_order_id = razorpay_order_id;
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    await payment.save();

    res.json({ message: 'Payment verified and captured successfully', payment });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order for Plan Registration
// @route   POST /api/payments/create-order
// @access  Private
export const createOrderForPlan = async (req, res) => {
  try {
    const { plan_id } = req.body;
    if (!plan_id) {
      res.status(400);
      throw new Error('Plan ID is required');
    }

    const plan = await Plan.findById(plan_id);
    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    // Find member by req.user._id (which maps to logged-in user)
    const member = await Member.findOne({ user_id: req.user._id || req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found for this user');
    }

    const options = {
      amount: Math.round(plan.price * 100), // in paise
      currency: 'INR',
      receipt: `plan_reg_${member._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey1234',
      plan_id: plan._id,
      member_id: member._id,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Plan Registration Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyOrderPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan_id) {
      res.status(400);
      throw new Error('Missing verification parameters');
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mocksecret1234');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error('Payment signature mismatch. Transaction failed.');
    }

    // Get Plan and Member details
    const plan = await Plan.findById(plan_id);
    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    const member = await Member.findOne({ user_id: req.user._id || req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found for this user');
    }

    // Create a new Payment record in database
    const payment = await Payment.create({
      member_id: member._id,
      gym_id: member.gym_id,
      amount: plan.price,
      payment_date: new Date(),
      due_date: new Date(), // settled on registration
      status: 'paid',
      payment_method: 'razorpay',
      plan_id: plan._id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Update Member expiry date and plan links
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

    member.plan_id = plan._id;
    member.plan_name = plan.name;
    member.expiry_date = expiryDate;
    member.status = 'pending_approval'; // set to pending approval so owner can review
    await member.save();

    res.json({
      message: 'Payment verified and membership activated. Awaiting staff approval.',
      payment,
      member,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/razorpay/webhook
// @access  Public
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhooksecret1234';
    
    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const paymentId = paymentEntity.notes.payment_id || paymentEntity.receipt;
      
      if (paymentId) {
        // If it starts with plan_reg, handle it as registration payment
        if (typeof paymentId === 'string' && paymentId.startsWith('plan_reg_')) {
          console.log('[Webhook] Registration order paid. Waiting for frontend signature verification.');
        } else {
          const payment = await Payment.findById(paymentId);
          if (payment && payment.status !== 'paid') {
            payment.status = 'paid';
            payment.payment_method = 'razorpay';
            payment.payment_date = new Date();
            await payment.save();
            console.log(`[Webhook] Payment ${paymentId} marked as paid successfully`);
          }
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook Error]:', error);
    res.status(500).json({ message: error.message });
  }
};
