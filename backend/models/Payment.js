import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Please link payment to a member'],
    },
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link payment to a gym'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add a payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    payment_date: {
      type: Date,
      default: Date.now,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    razorpay_order_id: {
      type: String,
      default: null,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },
    due_date: {
      type: Date,
      required: [true, 'Please add a payment due date'],
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'pending'],
      default: 'pending',
    },
    payment_method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'razorpay'],
      required: [true, 'Please add a payment method'],
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
