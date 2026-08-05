import cron from 'node-cron';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Attendance from '../models/Attendance.js';

export const initCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily payment due checks cron job...');
    await checkPaymentDueDates();
  });

  // Run daily just before midnight to close out anyone who forgot to check out
  cron.schedule('55 23 * * *', async () => {
    console.log('Running end-of-day attendance auto-checkout cron job...');
    await autoCloseOpenAttendanceSessions();
  });

  console.log('Cron schedule initialized: Daily payments monitor and attendance auto-checkout active.');
};

// @desc  Closes any attendance session still open (check_out_time: null) for
//        today, so a member who forgot to check out doesn't stay "active"
//        indefinitely and block their next day's check-in.
export const autoCloseOpenAttendanceSessions = async () => {
  try {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now);
    dayEnd.setHours(23, 59, 59, 999);

    const result = await Attendance.updateMany(
      { date: { $gte: dayStart, $lte: dayEnd }, check_out_time: null },
      { $set: { check_out_time: dayEnd } }
    );

    console.log(`[Cron] Auto-closed ${result.modifiedCount} forgotten check-in session(s) for today.`);
  } catch (error) {
    console.error('[Cron Error] Error executing attendance auto-checkout job:', error);
  }
};

export const checkPaymentDueDates = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find unpaid or pending payments with due dates within 3 days
    const upcomingPayments = await Payment.find({
      status: { $in: ['unpaid', 'pending'] },
      due_date: { $gte: now, $lte: threeDaysFromNow },
    }).populate({
      path: 'member_id',
      select: 'user_id',
    });

    console.log(`[Cron] Found ${upcomingPayments.length} upcoming unpaid/pending payments.`);

    let notificationsCreated = 0;

    for (const payment of upcomingPayments) {
      if (payment.member_id && payment.member_id.user_id) {
        const userId = payment.member_id.user_id;
        const dueDateString = new Date(payment.due_date).toLocaleDateString();

        // Check if reminder was already sent for this due date to avoid duplicate spams
        const existingNotification = await Notification.findOne({
          user_id: userId,
          message: new RegExp(dueDateString),
        });

        if (!existingNotification) {
          await Notification.create({
            gym_id: payment.gym_id,
            user_id: userId,
            message: `Friendly Reminder: Your membership payment of $${payment.amount} is due on ${dueDateString}. Please settle your dues.`,
          });
          notificationsCreated++;
        }
      }
    }
    console.log(`[Cron] Completed payment reminders check. Created ${notificationsCreated} notifications.`);
  } catch (error) {
    console.error('[Cron Error] Error executing payment reminders check job:', error);
  }
};
