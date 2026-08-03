import Plan from '../models/Plan.js';

// @desc    Create a new membership plan
// @route   POST /api/plans
// @access  Private (Owner only)
export const createPlan = async (req, res) => {
  try {
    const { name, duration_days, price, description } = req.body;

    if (!name || !duration_days || price === undefined) {
      res.status(400);
      throw new Error('Please fill in required fields (name, duration_days, price)');
    }

    const plan = await Plan.create({
      gym_id: req.user.gym_id,
      name,
      duration_days: Number(duration_days),
      price: Number(price),
      description: description || '',
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all plans for a gym (active plans for public/members, all plans for owners)
// @route   GET /api/plans
// @access  Private (Authenticated users)
export const getPlans = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    let query = { gym_id: gymId };
    
    // Non-owners (members/trainers) should only see active plans
    if (req.user.role !== 'owner') {
      query.is_active = true;
    }

    const plans = await Plan.find(query).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a membership plan
// @route   PUT /api/plans/:id
// @access  Private (Owner only)
export const updatePlan = async (req, res) => {
  try {
    const { name, duration_days, price, description, is_active } = req.body;

    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    // Verify ownership
    if (plan.gym_id.toString() !== req.user.gym_id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit plans for this gym branch');
    }

    plan.name = name !== undefined ? name : plan.name;
    plan.duration_days = duration_days !== undefined ? Number(duration_days) : plan.duration_days;
    plan.price = price !== undefined ? Number(price) : plan.price;
    plan.description = description !== undefined ? description : plan.description;
    plan.is_active = is_active !== undefined ? is_active : plan.is_active;

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Soft delete a plan (set is_active to false)
// @route   DELETE /api/plans/:id
// @access  Private (Owner only)
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    // Verify ownership
    if (plan.gym_id.toString() !== req.user.gym_id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete plans for this gym branch');
    }

    // Perform soft delete
    plan.is_active = false;
    await plan.save();

    res.json({ message: 'Plan deactivated successfully (soft-deleted)' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
