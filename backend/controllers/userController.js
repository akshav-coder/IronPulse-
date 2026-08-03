import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretgymkey12345!', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, gym_id, phone, role } = req.body;

    if (!name || !email || !password || !gym_id) {
      res.status(400);
      throw new Error('Please fill in all fields (name, email, password, gym_id)');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Enforce that public signup only allows 'member' role
    const assignedRole = 'member';

    // Resolve actual gym branch ID if gym_id is dummy or invalid
    let resolvedGymId = gym_id;
    const gymExists = await Gym.findById(gym_id);
    if (!gymExists) {
      const fallbackGym = await Gym.findOne();
      if (fallbackGym) {
        resolvedGymId = fallbackGym._id;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash: password,
      gym_id: resolvedGymId,
      phone,
      role: assignedRole,
    });

    if (user) {
      // Auto-create Member profile for the user
      await Member.create({
        user_id: user._id,
        gym_id: user.gym_id,
        membership_plan: null,
        status: 'pending_approval',
        assigned_trainer_id: null,
        join_date: new Date(),
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gym_id: user.gym_id,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gym_id: user.gym_id,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gym_id: user.gym_id,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    // JWT is stateless, so we just return success.
    // In cookies-based auth we would clear the cookie here.
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
