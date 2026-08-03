import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';

// @desc    Member Check-in
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      res.status(400);
      throw new Error('Member ID is required');
    }

    // Verify member exists
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Set date bounds for today (midnight to midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if user is already checked in today (and hasn't checked out yet)
    const activeSession = await Attendance.findOne({
      member_id,
      date: { $gte: todayStart, $lte: todayEnd },
      check_out_time: null,
    });

    if (activeSession) {
      res.status(400);
      throw new Error('Member is already checked in with an active session');
    }

    // Log the check-in
    const attendance = await Attendance.create({
      member_id,
      gym_id: member.gym_id,
      date: new Date(),
      check_in_time: new Date(),
      check_out_time: null,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Member Check-out
// @route   PUT /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      res.status(400);
      throw new Error('Member ID is required');
    }

    // Find active attendance session (check-out is null)
    const activeSession = await Attendance.findOne({
      member_id,
      check_out_time: null,
    }).sort({ createdAt: -1 });

    if (!activeSession) {
      res.status(404);
      throw new Error('No active check-in session found for this member');
    }

    activeSession.check_out_time = new Date();
    const updatedAttendance = await activeSession.save();

    res.json(updatedAttendance);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get attendance history for a member
// @route   GET /api/attendance/member/:member_id
// @access  Private
export const getMemberAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ member_id: req.params.member_id })
      .sort({ date: -1 })
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'name email phone' },
      });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance for a gym on a specific date
// @route   GET /api/attendance/gym/:gym_id
// @access  Private
export const getGymAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    const searchDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      gym_id: req.params.gym_id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ check_in_time: -1 })
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'name email phone' },
      });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
