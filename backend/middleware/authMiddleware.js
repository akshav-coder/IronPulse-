import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token and attach user's id and role
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretgymkey12345!');

      // Get user from token and attach id, role, and gym_id to request
      const user = await User.findById(decoded.id).select('role gym_id');

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = {
        id: user._id,
        _id: user._id,
        role: user.role,
        gym_id: user.gym_id,
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware for role-based access control (RBAC)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user credentials missing' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
