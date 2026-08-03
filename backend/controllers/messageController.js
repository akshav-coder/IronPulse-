import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send message to user
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message_text } = req.body;

    if (!receiver_id || !message_text) {
      res.status(400);
      throw new Error('Please provide receiver_id and message_text');
    }

    // Verify receiver exists
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      res.status(404);
      throw new Error('Receiver not found');
    }

    const message = await Message.create({
      gym_id: req.user.gym_id,
      sender_id: req.user.id,
      receiver_id,
      message_text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get conversation between logged-in user and another user
// @route   GET /api/messages/conversation/:other_user_id
// @access  Private
export const getConversation = async (req, res) => {
  try {
    const { other_user_id } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender_id: myId, receiver_id: other_user_id },
        { sender_id: other_user_id, receiver_id: myId },
      ],
    }).sort({ createdAt: 1 }); // Sorted chronologically

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/read/:sender_id
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { sender_id } = req.params;
    const myId = req.user.id;

    await Message.updateMany(
      { sender_id: sender_id, receiver_id: myId, is_read: false },
      { $set: { is_read: true } }
    );

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
