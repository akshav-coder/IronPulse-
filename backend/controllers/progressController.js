import Progress from '../models/Progress.js';
import Member from '../models/Member.js';

// @desc    Add member progress record
// @route   POST /api/progress
// @access  Private (Trainer only)
export const addProgressEntry = async (req, res) => {
  try {
    const { member_id, weight, measurements, notes, recorded_date } = req.body;

    if (!member_id || weight === undefined) {
      res.status(400);
      throw new Error('Please fill in required fields (member_id, weight)');
    }

    // Verify member exists
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Verify trainer is assigned to member
    if (member.assigned_trainer_id?.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to manage progress for this member');
    }

    const progress = await Progress.create({
      member_id,
      trainer_id: req.user.id,
      weight: Number(weight),
      measurements,
      notes,
      recorded_date: recorded_date || new Date(),
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get progress history for a member
// @route   GET /api/progress/member/:member_id
// @access  Private
export const getProgressHistory = async (req, res) => {
  try {
    const { member_id } = req.params;

    // Resolve Member profile
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    // Security Check:
    // - Member can see their own logs.
    // - Trainer can see their assigned trainee's logs.
    // - Owner can see all logs.
    if (req.user.role === 'member') {
      const selfMember = await Member.findOne({ user_id: req.user.id });
      if (!selfMember || selfMember._id.toString() !== member_id) {
        res.status(403);
        throw new Error('Not authorized to view this progress history');
      }
    } else if (req.user.role === 'trainer') {
      if (member.assigned_trainer_id?.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this client progress history');
      }
    }

    const progressLogs = await Progress.find({ member_id })
      .sort({ recorded_date: 1 }) // Sorted oldest to newest for lines chart timeline
      .populate('trainer_id', 'name email');

    res.json(progressLogs);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
