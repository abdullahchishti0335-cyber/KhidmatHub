import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide project title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide project description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide project category'],
      enum: [
        'Environment',
        'Education',
        'Health',
        'Technology',
        'Emergency Relief',
        'Community Welfare',
        'Other',
      ],
      default: 'Community Welfare',
    },
    location: {
      type: String,
      required: [true, 'Please provide project location or city'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    requiredVolunteers: {
      type: Number,
      required: [true, 'Please specify required volunteers count'],
      min: 1,
      default: 10,
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending_approval', 'active', 'completed', 'cancelled'],
      default: 'pending_approval',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    impactScore: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound text index for search queries
projectSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  skillsRequired: 'text',
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
