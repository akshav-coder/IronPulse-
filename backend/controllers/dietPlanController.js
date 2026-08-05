import DietPlan from '../models/DietPlan.js';
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

// @desc    Bulk assign a diet plan (routine meals array) to a member
// @route   POST /api/diet-plans/assign-bulk
// @access  Private (Trainer/Owner only)
export const assignBulkDietPlan = async (req, res) => {
  try {
    const { member_id, exercises } = req.body; // Using "exercises" from payload to reuse assignment schema

    if (!member_id || !Array.isArray(exercises) || exercises.length === 0) {
      res.status(400);
      throw new Error('Please select a member and provide meals to assign');
    }

    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Verify trainer is assigned to member
    if (!checkTrainerAccess(member, req.user)) {
      res.status(403);
      throw new Error('Not authorized to manage diet plans for this member');
    }

    // Replace existing active diet plan for this member with the new master plan
    await DietPlan.deleteMany({ member_id });

    const planItems = exercises.map((ex) => ({
      member_id,
      trainer_id: req.user.id,
      meal_name: ex.meal_name || ex.exercise_name || 'Healthy Meal',
      calories: Number(ex.calories) || 0,
      protein: Number(ex.protein) || 0,
      carbs: Number(ex.carbs) || 0,
      fat: Number(ex.fat) || 0,
      day_of_week: ex.day_of_week || 'Monday',
      day_subtitle: ex.day_subtitle || '',
    }));

    const createdItems = await DietPlan.insertMany(planItems);
    res.status(201).json(createdItems);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Add a meal item to a member's diet plan
// @route   POST /api/diet-plans
// @access  Private (Trainer/Owner only)
export const addDietPlanItem = async (req, res) => {
  try {
    const { member_id, meal_name, calories, protein, carbs, fat, day_of_week, day_subtitle } = req.body;

    if (!member_id || !meal_name || calories === undefined) {
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
      throw new Error('Not authorized to manage diet plans for this member');
    }

    const planItem = await DietPlan.create({
      member_id,
      trainer_id: req.user.id,
      meal_name,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      day_of_week: day_of_week || 'Monday',
      day_subtitle: day_subtitle || '',
    });

    res.status(201).json(planItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update a diet plan item
// @route   PUT /api/diet-plans/:id
// @access  Private (Trainer/Owner only)
export const updateDietPlanItem = async (req, res) => {
  try {
    const { meal_name, calories, protein, carbs, fat } = req.body;
    const planItem = await DietPlan.findById(req.params.id);

    if (!planItem) {
      res.status(404);
      throw new Error('Diet plan item not found');
    }

    // Verify trainer owns this plan/member assignment
    if (req.user.role === 'trainer' && planItem.trainer_id.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit this diet plan item');
    }

    planItem.meal_name = meal_name || planItem.meal_name;
    planItem.calories = calories !== undefined ? Number(calories) : planItem.calories;
    planItem.protein = protein !== undefined ? Number(protein) : planItem.protein;
    planItem.carbs = carbs !== undefined ? Number(carbs) : planItem.carbs;
    planItem.fat = fat !== undefined ? Number(fat) : planItem.fat;

    const updatedItem = await planItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a diet plan item
// @route   DELETE /api/diet-plans/:id
// @access  Private (Trainer/Owner only)
export const deleteDietPlanItem = async (req, res) => {
  try {
    const planItem = await DietPlan.findById(req.params.id);

    if (!planItem) {
      res.status(404);
      throw new Error('Diet plan item not found');
    }

    // Verify trainer
    if (req.user.role === 'trainer' && planItem.trainer_id.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this diet plan item');
    }

    await planItem.deleteOne();
    res.json({ message: 'Diet plan item removed successfully' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get member's diet plan
// @route   GET /api/diet-plans/member/:member_id
// @access  Private
export const getMemberDietPlan = async (req, res) => {
  try {
    const { member_id } = req.params;
    
    // Resolve Member profile
    const member = await Member.findById(member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    // Security Check
    if (req.user.role === 'member') {
      const selfMember = await Member.findOne({ user_id: req.user.id });
      if (!selfMember || selfMember._id.toString() !== member_id) {
        res.status(403);
        throw new Error('Not authorized to view this diet plan');
      }
    } else if (req.user.role === 'trainer') {
      if (!checkTrainerAccess(member, req.user)) {
        res.status(403);
        throw new Error('Not authorized to view this client diet plan');
      }
    }

    const plans = await DietPlan.find({ member_id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};
