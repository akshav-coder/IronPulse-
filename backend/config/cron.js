import cron from 'node-cron';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

export const initCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily payment due checks cron job...');
    await checkPaymentDueDates();
  });
  console.log('Cron schedule initialized: Daily payments monitor active.');
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
