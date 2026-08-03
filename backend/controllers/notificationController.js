import Notification from '../models/Notification.js';

// @desc    Create a new notification (Owner/Trainer/System only)
// @route   POST /api/notifications
// @access  Private
export const createNotification = async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      res.status(400);
      throw new Error('Please fill in all required fields (user_id, message)');
    }

    const notification = await Notification.create({
      gym_id: req.user.gym_id,
      user_id,
      message,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 notifications
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    notification.is_read = true;
    const updated = await notification.save();
    res.json(updated);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { $set: { is_read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
