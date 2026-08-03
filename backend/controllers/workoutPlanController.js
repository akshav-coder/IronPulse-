import WorkoutPlan from '../models/WorkoutPlan.js';
import Member from '../models/Member.js';

// Helper to check if trainer is assigned to the member as either primary trainer or dietitian specialist
const checkTrainerAccess = (member, reqUser) => {
  if (reqUser.role === 'owner') return true;
  if (reqUser.role === 'trainer') {
    const trainerIdStr = reqUser.id?.toString() || reqUser._id?.toString();
    const assignedTrainerId = member.assigned_trainer_id?._id || member.assigned_trainer_id;
    const assignedDietitianId = member.assigned_dietitian_id?._id || member.assigned_dietitian_id;

    const isAssignedTrainer = assignedTrainerId && assignedTrainerId.toString() === trainerIdStr;
    const isAssignedDietitian = assignedDietitianId && assignedDietitianId.toString() === trainerIdStr;

    return isAssignedTrainer || isAssignedDietitian;
  }
  return false;
};

// @desc    Bulk assign a workout plan (routine exercises array) to a member
// @route   POST /api/workout-plans/assign-bulk
// @access  Private (Trainer/Owner only)
export const assignBulkWorkoutPlan = async (req, res) => {
  try {
    const { member_id, exercises } = req.body;

    if (!member_id || !Array.isArray(exercises) || exercises.length === 0) {
      res.status(400);
      throw new Error('Please select a member and provide exercises to assign');
    }

    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Verify trainer is assigned to member
    if (!checkTrainerAccess(member, req.user)) {
      res.status(403);
      throw new Error('Not authorized to manage workout plans for this member');
    }

    // Replace existing active plan for this member with the new master plan
    await WorkoutPlan.deleteMany({ member_id });

    const planItems = exercises.map((ex) => ({
      member_id,
      trainer_id: req.user.id,
      exercise_name: ex.exercise_name,
      sets: Number(ex.sets),
      reps: Number(ex.reps),
      day_of_week: ex.day_of_week || 'Monday',
      day_subtitle: ex.day_subtitle || '',
    }));

    const createdItems = await WorkoutPlan.insertMany(planItems);
    res.status(201).json(createdItems);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Add an exercise item to a member's workout plan
// @route   POST /api/workout-plans
// @access  Private (Trainer/Owner only)
export const addWorkoutPlanItem = async (req, res) => {
  try {
    const { member_id, exercise_name, sets, reps, day_of_week, day_subtitle } = req.body;

    if (!member_id || !exercise_name || !sets || !reps) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Verify member exists
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Verify trainer is assigned to member
    if (!checkTrainerAccess(member, req.user)) {
      res.status(403);
      throw new Error('Not authorized to manage workout plans for this member');
    }

    const planItem = await WorkoutPlan.create({
      member_id,
      trainer_id: req.user.id,
      exercise_name,
      sets: Number(sets),
      reps: Number(reps),
      day_of_week: day_of_week || 'Monday',
      day_subtitle: day_subtitle || '',
    });

    res.status(201).json(planItem);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update a workout plan item
// @route   PUT /api/workout-plans/:id
// @access  Private (Trainer/Owner only)
export const updateWorkoutPlanItem = async (req, res) => {
  try {
    const { exercise_name, sets, reps } = req.body;
    const planItem = await WorkoutPlan.findById(req.params.id);

    if (!planItem) {
      res.status(404);
      throw new Error('Workout plan item not found');
    }

    // Verify trainer owns this plan/member assignment
    if (req.user.role === 'trainer' && planItem.trainer_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to edit this workout plan item');
    }

    planItem.exercise_name = exercise_name || planItem.exercise_name;
    planItem.sets = sets !== undefined ? Number(sets) : planItem.sets;
    planItem.reps = reps !== undefined ? Number(reps) : planItem.reps;

    const updatedItem = await planItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a workout plan item
// @route   DELETE /api/workout-plans/:id
// @access  Private (Trainer/Owner only)
export const deleteWorkoutPlanItem = async (req, res) => {
  try {
    const planItem = await WorkoutPlan.findById(req.params.id);

    if (!planItem) {
      res.status(404);
      throw new Error('Workout plan item not found');
    }

    // Verify trainer
    if (req.user.role === 'trainer' && planItem.trainer_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this workout plan item');
    }

    await planItem.deleteOne();
    res.json({ message: 'Workout plan item removed successfully' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get member's workout plan
// @route   GET /api/workout-plans/member/:member_id
// @access  Private
export const getMemberWorkoutPlan = async (req, res) => {
  try {
    const { member_id } = req.params;
    
    // Resolve Member profile
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    // Security Check:
    // - Member can see their own plan.
    // - Trainer/Dietitian can see their assigned client's plan.
    // - Owner can see all plans.
    if (req.user.role === 'member') {
      const selfMember = await Member.findOne({ user_id: req.user.id });
      if (!selfMember || selfMember._id.toString() !== member_id) {
        res.status(403);
        throw new Error('Not authorized to view this workout plan');
      }
    } else if (req.user.role === 'trainer') {
      if (!checkTrainerAccess(member, req.user)) {
        res.status(403);
        throw new Error('Not authorized to view this client workout plan');
      }
    }

    const plans = await WorkoutPlan.find({ member_id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
