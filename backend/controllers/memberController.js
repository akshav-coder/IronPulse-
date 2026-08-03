import Member from '../models/Member.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';

// @desc    Create a new member (Owner only)
// @route   POST /api/members
// @access  Private/Owner
export const createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      membership_plan,
      join_date,
      expiry_date,
      assigned_trainer_id,
      assigned_dietitian_id,
    } = req.body;

    if (!name || !email || !membership_plan) {
      res.status(400);
      throw new Error('Please fill in required fields (name, email, membership_plan)');
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('A user with this email already exists');
    }

    // Create User credentials profile first
    const user = await User.create({
      gym_id: req.user.gym_id,
      name,
      email,
      phone,
      password_hash: password || 'gym123456', // default temp password
      role: 'member',
    });

    // Look up Plan details
    let plan = null;
    let finalPlanName = membership_plan;
    let finalPlanId = null;

    if (mongoose.Types.ObjectId.isValid(membership_plan)) {
      plan = await Plan.findById(membership_plan);
    } else {
      plan = await Plan.findOne({ name: membership_plan, gym_id: req.user.gym_id });
    }

    if (plan) {
      finalPlanId = plan._id;
      finalPlanName = plan.name;
    }

    // Create Member profile
    const member = await Member.create({
      user_id: user._id,
      gym_id: req.user.gym_id,
      plan_id: finalPlanId,
      plan_name: finalPlanName,
      status: 'active', // Direct owner creation is active
      join_date: join_date || Date.now(),
      expiry_date,
      assigned_trainer_id: assigned_trainer_id || null,
      assigned_dietitian_id: assigned_dietitian_id || null,
    });

    // Retrieve full member record populated with user details
    const populatedMember = await Member.findById(member._id)
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    res.status(201).json(populatedMember);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all members by gym_id
// @route   GET /api/members/gym/:gym_id
// @access  Private
export const getMembersByGym = async (req, res) => {
  try {
    const members = await Member.find({ gym_id: req.params.gym_id })
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    res.json(member);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = async (req, res) => {
  try {
    const {
      name,
      phone,
      membership_plan,
      expiry_date,
      status,
      assigned_trainer_id,
      assigned_dietitian_id,
    } = req.body;

    const member = await Member.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Update user profile fields if provided
    if (name || phone) {
      const user = await User.findById(member.user_id);
      if (user) {
        user.name = name || user.name;
        user.phone = phone || user.phone;
        await user.save();
      }
    }

    // Update member fields
    if (membership_plan !== undefined) {
      let plan = null;
      let finalPlanName = membership_plan;
      let finalPlanId = null;

      if (mongoose.Types.ObjectId.isValid(membership_plan)) {
        plan = await Plan.findById(membership_plan);
      } else {
        plan = await Plan.findOne({ name: membership_plan, gym_id: member.gym_id });
      }

      if (plan) {
        finalPlanId = plan._id;
        finalPlanName = plan.name;
      }
      member.plan_id = finalPlanId;
      member.plan_name = finalPlanName;
    }
    member.expiry_date = expiry_date !== undefined ? expiry_date : member.expiry_date;
    member.status = status || member.status;
    member.assigned_trainer_id = assigned_trainer_id !== undefined ? assigned_trainer_id : member.assigned_trainer_id;
    member.assigned_dietitian_id = assigned_dietitian_id !== undefined ? assigned_dietitian_id : member.assigned_dietitian_id;

    const updatedMember = await member.save();

    const populatedMember = await Member.findById(updatedMember._id)
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    res.json(populatedMember);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete member (Owner only)
// @route   DELETE /api/members/:id
// @access  Private/Owner
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Delete associated User credentials profile
    await User.findByIdAndDelete(member.user_id);

    // Delete Member profile
    await member.deleteOne();

    res.json({ message: 'Member and linked user account successfully removed' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get logged in member profile
// @route   GET /api/members/profile/me
// @access  Private
export const getMyMemberProfile = async (req, res) => {
  try {
    const member = await Member.findOne({ user_id: req.user.id })
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk import member records from CSV
// @route   POST /api/members/import
// @access  Private/Owner
export const importMembersCsv = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file');
    }

    const filePath = req.file.path;

    // Parse CSV rows into an array
    const parsedRows = await new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', () => resolve(rows))
        .on('error', (err) => reject(err));
    });

    // Remove temporary file asynchronously
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to unlink uploaded CSV file:', err);
    });

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const name = row.name || row.Name || row.NAME;
      const email = row.email || row.Email || row.EMAIL;
      const phone = row.phone || row.Phone || row.PHONE || '';
      const membership_plan = row.membership_plan || row.MembershipPlan || row.MEMBERSHIP_PLAN || row.plan || row.Plan;
      const password = row.password || row.Password || row.PASSWORD || 'gym123456';

      const rowNum = i + 1;

      if (!name || !email || !membership_plan) {
        errorCount++;
        errors.push(`Row ${rowNum}: Missing required fields (name, email, membership_plan)`);
        continue;
      }

      // Check if user email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        errorCount++;
        errors.push(`Row ${rowNum}: Email '${email}' already exists`);
        continue;
      }

      try {
        // Create user
        const user = await User.create({
          gym_id: req.user.gym_id,
          name,
          email,
          phone,
          password_hash: password,
          role: 'member',
        });

        // Look up Plan details for import row
        let plan = null;
        let finalPlanName = membership_plan;
        let finalPlanId = null;

        if (mongoose.Types.ObjectId.isValid(membership_plan)) {
          plan = await Plan.findById(membership_plan);
        } else {
          plan = await Plan.findOne({ name: membership_plan, gym_id: req.user.gym_id });
        }

        if (plan) {
          finalPlanId = plan._id;
          finalPlanName = plan.name;
        }

        // Create member
        await Member.create({
          user_id: user._id,
          gym_id: req.user.gym_id,
          plan_id: finalPlanId,
          plan_name: finalPlanName,
          status: 'active',
          join_date: new Date(),
        });

        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Row ${rowNum} DB Error: ${err.message}`);
      }
    }

    res.json({
      success: true,
      successCount,
      errorCount,
      errors,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all pending members for a gym (Owner/Trainer only)
// @route   GET /api/members/gym/:gym_id/pending
// @access  Private
export const getPendingMembers = async (req, res) => {
  try {
    // Both Owner and Trainer can access
    if (req.user.role !== 'owner' && req.user.role !== 'trainer') {
      res.status(403);
      throw new Error('Not authorized to access pending signups');
    }

    const pendingMembers = await Member.find({
      gym_id: req.params.gym_id,
      status: 'pending_approval',
    })
      .populate('user_id', 'name email phone role')
      .sort({ createdAt: -1 });

    res.json(pendingMembers);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Approve a pending member signup (Owner/Trainer only)
// @route   PUT /api/members/:id/approve
// @access  Private
export const approvePendingMember = async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'trainer') {
      res.status(403);
      throw new Error('Not authorized to approve signups');
    }

    const { assigned_trainer_id, assigned_dietitian_id } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    if (member.status !== 'pending_approval') {
      res.status(400);
      throw new Error('Member is not in pending approval state');
    }

    member.status = 'active';
    member.assigned_trainer_id = assigned_trainer_id || null;
    member.assigned_dietitian_id = assigned_dietitian_id || null;
    member.rejection_reason = null;

    const updatedMember = await member.save();
    
    const populated = await Member.findById(updatedMember._id)
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Reject a pending member signup (Owner/Trainer only)
// @route   PUT /api/members/:id/reject
// @access  Private
export const rejectPendingMember = async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'trainer') {
      res.status(403);
      throw new Error('Not authorized to reject signups');
    }

    const { reason } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    if (member.status !== 'pending_approval') {
      res.status(400);
      throw new Error('Member is not in pending approval state');
    }

    member.status = 'rejected';
    member.rejection_reason = reason || 'Membership signup rejected';

    const updatedMember = await member.save();

    const populated = await Member.findById(updatedMember._id)
      .populate('user_id', 'name email phone role');

    res.json(populated);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all unassigned members for a gym
// @route   GET /api/members/gym/:gym_id/unassigned
// @access  Private
export const getUnassignedMembers = async (req, res) => {
  try {
    const unassignedMembers = await Member.find({
      gym_id: req.params.gym_id,
      status: { $ne: 'rejected' },
      $or: [
        { assigned_trainer_id: null },
        { assigned_trainer_id: { $exists: false } },
      ],
    })
      .populate('user_id', 'name email phone role')
      .populate('assigned_trainer_id', 'name email phone')
      .populate('assigned_dietitian_id', 'name email phone');

    res.json(unassignedMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

