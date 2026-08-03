import Member from '../models/Member.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// @desc    Get dashboard metrics for owner
// @route   GET /api/dashboard/owner/:gym_id
// @access  Private/Owner
export const getOwnerDashboardMetrics = async (req, res) => {
  try {
    const { gym_id } = req.params;

    if (!gym_id) {
      res.status(400);
      throw new Error('Gym ID is required');
    }

    // Verify requesting user is linked to this gym
    // (Ensure owners can only view their own gym's metrics)
    if (req.user.role === 'owner' && req.user.gym_id && req.user.gym_id.toString() !== gym_id) {
      res.status(403);
      throw new Error('Unauthorized: You can only view metrics for your own gym');
    }

    // 1. Total members count
    const totalMembers = await Member.countDocuments({ gym_id });

    // 2. Active members count
    const activeMembers = await Member.countDocuments({ gym_id, status: 'active' });

    // 3. Active trainers count
    const activeTrainers = await User.countDocuments({ gym_id, role: 'trainer' });

    // 4. Monthly revenue calculation (current month paid invoices sum)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const paidInvoices = await Payment.find({
      gym_id,
      status: 'paid',
      payment_date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const monthlyRevenue = paidInvoices.reduce((sum, item) => sum + (item.amount || 0), 0);

    // 5. Pending payments count (pending or unpaid invoices)
    const pendingPaymentsCount = await Payment.countDocuments({
      gym_id,
      status: { $in: ['pending', 'unpaid'] },
    });

    res.json({
      gym_id,
      totalMembers,
      activeMembers,
      activeTrainers,
      monthlyRevenue,
      pendingPaymentsCount,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get Owner Revenue Report details
// @route   GET /api/dashboard/owner/revenue/report
// @access  Private/Owner
export const getOwnerRevenueReport = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    if (!gymId) {
      res.status(400);
      throw new Error('User is not linked to any gym branch');
    }

    // 1. Fetch all paid payments for this gym
    const paidPayments = await Payment.find({
      gym_id: gymId,
      status: 'paid',
    }).sort({ payment_date: 1 });

    const monthlyMap = {};
    const methodMap = {};

    paidPayments.forEach((p) => {
      const date = new Date(p.payment_date || p.createdAt);
      // Group key format: YYYY-MM (e.g. 2026-07)
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[yearMonth] = (monthlyMap[yearMonth] || 0) + (p.amount || 0);

      // Group key method: cash, card, upi, bank_transfer
      const method = p.payment_method || 'other';
      methodMap[method] = (methodMap[method] || 0) + (p.amount || 0);
    });

    // 2. Fetch pending invoices dues total sum
    const pendingPayments = await Payment.find({
      gym_id: gymId,
      status: { $in: ['unpaid', 'pending'] },
    });
    const pendingTotal = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 3. Format monthly records chronologically
    const monthlyRevenue = Object.keys(monthlyMap)
      .map((m) => ({ month: m, revenue: monthlyMap[m] }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 4. Format payment method records
    const methodRevenue = Object.keys(methodMap).map((method) => ({
      method,
      revenue: methodMap[method],
    }));

    res.json({
      monthlyRevenue,
      methodRevenue,
      pendingTotal,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
