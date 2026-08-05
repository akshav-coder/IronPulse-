import jwt from 'jsonwebtoken';
import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretgymkey12345!';
const QR_TOKEN_PURPOSE = 'attendance_qr';
const QR_TOKEN_TTL_SECONDS = 60;

const getDayBounds = (referenceDate = new Date()) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Creates the check-in record, relying on the partial unique index
// ({member_id, check_out_time: null}) to atomically reject a second
// concurrent check-in rather than trusting only the prior read.
const performCheckIn = async (member) => {
  try {
    return await Attendance.create({
      member_id: member._id,
      gym_id: member.gym_id,
      date: new Date(),
      check_in_time: new Date(),
      check_out_time: null,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Member is already checked in with an active session');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }
    throw error;
  }
};

const performCheckOut = async (member_id) => {
  const activeSession = await Attendance.findOne({
    member_id,
    check_out_time: null,
  }).sort({ createdAt: -1 });

  if (!activeSession) {
    const notFoundError = new Error('No active check-in session found for this member');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  activeSession.check_out_time = new Date();
  return await activeSession.save();
};

// @desc    Member Check-in
// @route   POST /api/attendance/check-in
// @access  Private (owner, trainer)
export const checkIn = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      res.status(400);
      throw new Error('Member ID is required');
    }

    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    if (member.gym_id.toString() !== req.user.gym_id.toString()) {
      res.status(403);
      throw new Error('Forbidden: Member belongs to a different gym');
    }

    const { start, end } = getDayBounds();
    const activeSession = await Attendance.findOne({
      member_id,
      date: { $gte: start, $lte: end },
      check_out_time: null,
    });

    if (activeSession) {
      res.status(400);
      throw new Error('Member is already checked in with an active session');
    }

    const attendance = await performCheckIn(member);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(error.statusCode || res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Member Check-out
// @route   PUT /api/attendance/check-out
// @access  Private (owner, trainer)
export const checkOut = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      res.status(400);
      throw new Error('Member ID is required');
    }

    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    if (member.gym_id.toString() !== req.user.gym_id.toString()) {
      res.status(403);
      throw new Error('Forbidden: Member belongs to a different gym');
    }

    const updatedAttendance = await performCheckOut(member_id);
    res.json(updatedAttendance);
  } catch (error) {
    res.status(error.statusCode || res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Issue a short-lived signed token encoding the requesting member's own
//          identity, to be rendered as a QR code and scanned by staff.
// @route   GET /api/attendance/qr-token
// @access  Private (member, for their own token)
export const getQrToken = async (req, res) => {
  try {
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('No member profile found for this account');
    }

    const token = jwt.sign(
      {
        member_id: member._id,
        gym_id: member.gym_id,
        purpose: QR_TOKEN_PURPOSE,
      },
      JWT_SECRET,
      { expiresIn: QR_TOKEN_TTL_SECONDS }
    );

    res.json({ token, expiresIn: QR_TOKEN_TTL_SECONDS });
  } catch (error) {
    res.status(res.statusCode !== 200 ? res.statusCode : 500);
    res.json({ message: error.message });
  }
};

// @desc    Scan a member's QR token to check them in. Check-out is
//          intentionally not handled here — members check themselves out
//          via checkOutSelf, or the end-of-day cron closes forgotten sessions.
// @route   POST /api/attendance/scan
// @access  Private (owner, trainer)
export const scanCheckIn = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400);
      throw new Error('QR token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (verifyError) {
      res.status(401);
      throw new Error('QR code is invalid or has expired, ask the member to refresh it');
    }

    if (decoded.purpose !== QR_TOKEN_PURPOSE) {
      res.status(400);
      throw new Error('Invalid QR code');
    }

    const member = await Member.findById(decoded.member_id).populate({
      path: 'user_id',
      select: 'name email phone',
    });
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    const memberSummary = {
      name: member.user_id?.name || 'Member',
      email: member.user_id?.email,
      phone: member.user_id?.phone,
      plan_name: member.plan_name,
    };

    if (member.gym_id.toString() !== req.user.gym_id.toString()) {
      res.status(403);
      throw new Error('Forbidden: Member belongs to a different gym');
    }

    const { start, end } = getDayBounds();
    const activeSession = await Attendance.findOne({
      member_id: member._id,
      date: { $gte: start, $lte: end },
      check_out_time: null,
    });

    if (activeSession) {
      const alreadyCheckedInError = new Error('Member is already checked in with an active session');
      alreadyCheckedInError.statusCode = 400;
      alreadyCheckedInError.member = memberSummary;
      throw alreadyCheckedInError;
    }

    const attendance = await performCheckIn(member);
    res.status(201).json({ action: 'check-in', member: memberSummary, attendance });
  } catch (error) {
    res
      .status(error.statusCode || res.statusCode || 500)
      .json({ message: error.message, ...(error.member && { member: error.member }) });
  }
};

// @desc    Whether the requesting member currently has an open check-in
//          session, so the app can enable/disable the self-checkout button.
// @route   GET /api/attendance/status-self
// @access  Private (member, for their own status)
export const getSelfStatus = async (req, res) => {
  try {
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('No member profile found for this account');
    }

    const activeSession = await Attendance.findOne({
      member_id: member._id,
      check_out_time: null,
    }).sort({ createdAt: -1 });

    res.json({
      checkedIn: !!activeSession,
      checkInTime: activeSession?.check_in_time || null,
    });
  } catch (error) {
    res.status(error.statusCode || res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Member checks themselves out of their own active session.
// @route   PUT /api/attendance/check-out-self
// @access  Private (member, for their own session)
export const checkOutSelf = async (req, res) => {
  try {
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('No member profile found for this account');
    }

    const updatedAttendance = await performCheckOut(member._id);
    res.json(updatedAttendance);
  } catch (error) {
    res.status(error.statusCode || res.statusCode || 500).json({ message: error.message });
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
    const { start, end } = getDayBounds(searchDate);

    const records = await Attendance.find({
      gym_id: req.params.gym_id,
      date: { $gte: start, $lte: end },
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
