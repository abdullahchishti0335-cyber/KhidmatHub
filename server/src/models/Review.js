import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per user per project
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
