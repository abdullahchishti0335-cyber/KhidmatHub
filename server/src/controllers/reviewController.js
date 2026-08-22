import Review from '../models/Review.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { recalculateImpactScore } from './projectController.js';

// @desc    Add a review for a project
// @route   POST /api/v1/reviews
export const addReview = async (req, res, next) => {
  try {
    const { projectId, rating, comment } = req.body;

    if (!projectId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, rating (1-5), and review comment are required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only approved project team members can submit reviews for this project.',
      });
    }

    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this project.',
      });
    }

    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Recalculate average rating for project
    const allReviews = await Review.find({ project: projectId });
    const avgRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    project.averageRating = Math.round(avgRating * 10) / 10;
    project.totalReviews = allReviews.length;
    await project.save();

    // Reward volunteer +25 points for constructive feedback
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 25 } });

    await recalculateImpactScore(projectId);

    const populatedReview = await Review.findById(review._id).populate(
      'reviewer',
      'name email avatar badges'
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: populatedReview,
      projectRating: {
        averageRating: project.averageRating,
        totalReviews: project.totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a project
// @route   GET /api/v1/reviews/project/:projectId
export const getProjectReviews = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const reviews = await Review.find({ project: projectId })
      .populate('reviewer', 'name email avatar badges city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
