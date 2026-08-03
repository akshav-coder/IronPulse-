import Workout from '../models/Workout.js';
import Member from '../models/Member.js';

// @desc    Get all user workouts
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = async (req, res) => {
  try {
    const { title, load, reps, duration, plan_id } = req.body;

    if (!title || load === undefined || reps === undefined || duration === undefined) {
      res.status(400);
      throw new Error('Please fill in all fields (title, load, reps, duration)');
    }

    const workout = await Workout.create({
      title,
      load,
      reps,
      duration,
      plan_id: plan_id || null,
      user: req.user._id,
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req, res) => {
  try {
    const { title, load, reps, duration } = req.body;

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error('Workout not found');
    }

    // Verify workout owner
    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this workout');
    }

    workout.title = title || workout.title;
    workout.load = load !== undefined ? load : workout.load;
    workout.reps = reps !== undefined ? reps : workout.reps;
    workout.duration = duration !== undefined ? duration : workout.duration;

    const updatedWorkout = await workout.save();
    res.json(updatedWorkout);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error('Workout not found');
    }

    // Verify workout owner
    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this workout');
    }

    await workout.deleteOne();
    res.json({ message: 'Workout removed successfully', id: req.params.id });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get member workouts for owner/trainer
// @route   GET /api/workouts/member/:member_id
// @access  Private/Owner/Trainer
export const getMemberWorkouts = async (req, res) => {
  try {
    const member = await Member.findById(req.params.member_id);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }
    const workouts = await Workout.find({ user: member.user_id }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

