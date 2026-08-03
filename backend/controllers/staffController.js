import User from '../models/User.js';
import Member from '../models/Member.js';

// @desc    Register a new trainer (Owner only)
// @route   POST /api/staff
// @access  Private/Owner
export const createTrainer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User email already registered');
    }

    // Create trainer user
    const trainer = await User.create({
      gym_id: req.user.gym_id, // Owner's gym
      name,
      email,
      phone,
      password_hash: password, // Pre-save hooks hashes it
      role: 'trainer',
    });

    res.status(201).json({
      _id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      role: trainer.role,
      gym_id: trainer.gym_id,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all trainers for owner's gym
// @route   GET /api/staff/gym/:gym_id
// @access  Private/Owner
export const getTrainers = async (req, res) => {
  try {
    const { gym_id } = req.params;
    console.log('getTrainers req.user payload:', req.user);

    // Verify owner owns this gym
    if (req.user.gym_id.toString() !== gym_id) {
      res.status(403);
      throw new Error('Not authorized to access this gym staff list');
    }

    const trainers = await User.find({ gym_id, role: { $in: ['trainer', 'owner'] } }).sort({ createdAt: -1 });
    res.json(trainers);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update trainer details (Owner only)
// @route   PUT /api/staff/:id
// @access  Private/Owner
export const updateTrainer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer', gym_id: req.user.gym_id });

    if (!trainer) {
      res.status(404);
      throw new Error('Trainer not found or not in your gym');
    }

    // If changing email, check uniqueness
    if (email && email !== trainer.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email address is already in use');
      }
      trainer.email = email;
    }

    trainer.name = name || trainer.name;
    trainer.phone = phone !== undefined ? phone : trainer.phone;

    const updatedTrainer = await trainer.save();
    res.json({
      _id: updatedTrainer._id,
      name: updatedTrainer.name,
      email: updatedTrainer.email,
      phone: updatedTrainer.phone,
      role: updatedTrainer.role,
      gym_id: updatedTrainer.gym_id,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete trainer (Owner only)
// @route   DELETE /api/staff/:id
// @access  Private/Owner
export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer', gym_id: req.user.gym_id });

    if (!trainer) {
      res.status(404);
      throw new Error('Trainer not found or not in your gym');
    }

    // Delete trainer user credentials
    await trainer.deleteOne();

    // Unset both trainer and dietitian references on any members assigned to this staff member
    await Member.updateMany(
      { $or: [{ assigned_trainer_id: req.params.id }, { assigned_dietitian_id: req.params.id }] },
      { $unset: { assigned_trainer_id: '', assigned_dietitian_id: '' } }
    );

    res.json({ message: 'Trainer and associated training assignments removed successfully' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
