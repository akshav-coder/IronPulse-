import Booking from '../models/Booking.js';
import Class from '../models/Class.js';
import Member from '../models/Member.js';

// @desc    Book a slot in a gym class session
// @route   POST /api/bookings
// @access  Private (Member only)
export const bookClass = async (req, res) => {
  try {
    const { class_id } = req.body;

    if (!class_id) {
      res.status(400);
      throw new Error('Class ID is required');
    }

    // 1. Resolve Member profile for logged in user
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    // 2. Resolve Class session
    const gymClass = await Class.findById(class_id);
    if (!gymClass) {
      res.status(404);
      throw new Error('Class session not found');
    }

    // 3. Check for existing booking
    const alreadyBooked = await Booking.findOne({ class_id, member_id: member._id });
    if (alreadyBooked) {
      res.status(400);
      throw new Error('You have already booked a slot in this session');
    }

    // 4. Validate class capacity bounds
    const bookedCount = await Booking.countDocuments({ class_id });
    if (bookedCount >= gymClass.capacity) {
      res.status(400);
      throw new Error('Class capacity is fully filled');
    }

    // 5. Create Booking record
    const booking = await Booking.create({
      class_id,
      member_id: member._id,
    });

    res.status(201).json({
      message: 'Class session slot booked successfully',
      booking,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Cancel a booked class slot
// @route   POST /api/bookings/cancel
// @access  Private (Member only)
export const cancelBooking = async (req, res) => {
  try {
    const { class_id } = req.body;

    if (!class_id) {
      res.status(400);
      throw new Error('Class ID is required');
    }

    // Resolve Member profile
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    // Find and delete booking
    const booking = await Booking.findOne({ class_id, member_id: member._id });
    if (!booking) {
      res.status(404);
      throw new Error('Booking slot not found for this class');
    }

    await booking.deleteOne();
    res.json({ message: 'Class session slot booking canceled successfully' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get gym classes list with member booking status
// @route   GET /api/bookings/gym/:gym_id
// @access  Private (Member only)
export const getGymClassesWithBookingStatus = async (req, res) => {
  try {
    const { gym_id } = req.params;

    // Resolve Member profile
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('Member profile not found');
    }

    const classes = await Class.find({ gym_id })
      .populate('trainer_id', 'name email')
      .sort({ schedule_time: 1 });

    const enrichedClasses = await Promise.all(
      classes.map(async (c) => {
        const bookedCount = await Booking.countDocuments({ class_id: c._id });
        const userBooked = await Booking.findOne({ class_id: c._id, member_id: member._id });
        return {
          ...c._doc,
          bookedCount,
          userBooked: !!userBooked,
        };
      })
    );

    res.json(enrichedClasses);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Toggle class booking attendance (Trainer or Owner only)
// @route   PUT /api/bookings/:id/attendance
// @access  Private/Owner/Trainer
export const toggleClassAttendance = async (req, res) => {
  try {
    const { attended } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking slot not found');
    }

    booking.attended = attended !== undefined ? attended : !booking.attended;
    const updatedBooking = await booking.save();

    res.json({
      message: 'Attendance status updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
