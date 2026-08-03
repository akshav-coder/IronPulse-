import Class from '../models/Class.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Create a new gym class session (Owner only)
// @route   POST /api/classes
// @access  Private/Owner
export const createClass = async (req, res) => {
  try {
    const { class_name, trainer_id, schedule_time, capacity } = req.body;

    if (!class_name || !trainer_id || !schedule_time || !capacity) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Verify trainer is in the gym and role is trainer
    const trainerExists = await User.findOne({ _id: trainer_id, role: 'trainer', gym_id: req.user.gym_id });
    if (!trainerExists) {
      res.status(400);
      throw new Error('Assigned trainer not found in your gym');
    }

    const newClass = await Class.create({
      gym_id: req.user.gym_id,
      trainer_id,
      class_name,
      schedule_time,
      capacity: Number(capacity),
    });

    const populatedClass = await Class.findById(newClass._id).populate('trainer_id', 'name email phone');
    res.status(201).json(populatedClass);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all scheduled classes for a gym
// @route   GET /api/classes/gym/:gym_id
// @access  Private/Owner
export const getClasses = async (req, res) => {
  try {
    const { gym_id } = req.params;

    // Verify owner owns this gym
    if (req.user.gym_id.toString() !== gym_id) {
      res.status(403);
      throw new Error('Not authorized to access this gym class schedule');
    }

    const classes = await Class.find({ gym_id })
      .populate('trainer_id', 'name email phone')
      .sort({ schedule_time: 1 });
    
    res.json(classes);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update class session details (Owner only)
// @route   PUT /api/classes/:id
// @access  Private/Owner
export const updateClass = async (req, res) => {
  try {
    const { class_name, trainer_id, schedule_time, capacity } = req.body;
    const gymClass = await Class.findOne({ _id: req.params.id, gym_id: req.user.gym_id });

    if (!gymClass) {
      res.status(404);
      throw new Error('Class session not found in your gym');
    }

    // Verify trainer is valid if changing it
    if (trainer_id && trainer_id !== gymClass.trainer_id.toString()) {
      const trainerExists = await User.findOne({ _id: trainer_id, role: 'trainer', gym_id: req.user.gym_id });
      if (!trainerExists) {
        res.status(400);
        throw new Error('Assigned trainer not found in your gym');
      }
      gymClass.trainer_id = trainer_id;
    }

    gymClass.class_name = class_name || gymClass.class_name;
    gymClass.schedule_time = schedule_time || gymClass.schedule_time;
    gymClass.capacity = capacity !== undefined ? Number(capacity) : gymClass.capacity;

    const updatedClass = await gymClass.save();
    const populatedClass = await Class.findById(updatedClass._id).populate('trainer_id', 'name email phone');
    res.json(populatedClass);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete class session (Owner only)
// @route   DELETE /api/classes/:id
// @access  Private/Owner
export const deleteClass = async (req, res) => {
  try {
    const gymClass = await Class.findOne({ _id: req.params.id, gym_id: req.user.gym_id });

    if (!gymClass) {
      res.status(404);
      throw new Error('Class session not found in your gym');
    }

    await gymClass.deleteOne();
    res.json({ message: 'Class session removed from schedule successfully' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get trainer classes and booked members
// @route   GET /api/classes/trainer/me
// @access  Private (Trainer only)
export const getTrainerClasses = async (req, res) => {
  try {
    const classes = await Class.find({ trainer_id: req.user.id }).sort({ schedule_time: 1 });

    const enrichedClasses = await Promise.all(
      classes.map(async (c) => {
        const bookings = await Booking.find({ class_id: c._id })
          .populate({
            path: 'member_id',
            populate: { path: 'user_id', select: 'name email phone' },
          });

        return {
          ...c._doc,
          bookings: bookings.map((b) => ({
            booking_id: b._id,
            attended: b.attended,
            member_id: b.member_id?._id,
            name: b.member_id?.user_id?.name || 'Unknown Client',
            email: b.member_id?.user_id?.email || '',
            phone: b.member_id?.user_id?.phone || '',
          })),
        };
      })
    );

    res.json(enrichedClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

