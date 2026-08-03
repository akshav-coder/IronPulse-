import DietLog from '../models/DietLog.js';

// @desc    Get all user logged meals
// @route   GET /api/diet-logs
// @access  Private
export const getDietLogs = async (req, res) => {
  try {
    const logs = await DietLog.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Create a new meal log
// @route   POST /api/diet-logs
// @access  Private
export const createDietLog = async (req, res) => {
  try {
    const { title, calories, protein, carbs, fat, plan_id } = req.body;

    if (!title || calories === undefined) {
      res.status(400);
      throw new Error('Please fill in all required fields (title, calories)');
    }

    const log = await DietLog.create({
      title,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      plan_id: plan_id || null,
      user: req.user._id,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a logged meal
// @route   DELETE /api/diet-logs/:id
// @access  Private
export const deleteDietLog = async (req, res) => {
  try {
    const log = await DietLog.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Meal log not found');
    }

    // Verify ownership
    if (log.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this log');
    }

    await log.deleteOne();
    res.json({ message: 'Meal log removed successfully' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode || 500).json({ message: error.message });
  }
};
