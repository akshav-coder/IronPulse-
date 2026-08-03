import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a gym name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    logo_url: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Gym = mongoose.model('Gym', gymSchema);
export default Gym;
