import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @desc    Get top volunteers leaderboard & project impact rankings
// @route   GET /api/v1/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    // Top students / volunteers
    const topVolunteers = await User.find({ role: 'student', status: 'active' })
      .select('name email avatar points hoursContributed city badges createdAt')
      .sort({ points: -1, hoursContributed: -1 })
      .limit(Number(limit));

    // Enhance each volunteer with task count
    const volunteersWithStats = await Promise.all(
      topVolunteers.map(async (v, index) => {
        const completedTasksCount = await Task.countDocuments({
          assignedTo: v._id,
          status: 'COMPLETED',
        });
        const joinedProjectsCount = await Project.countDocuments({
          members: v._id,
        });

        return {
          rank: index + 1,
          id: v._id,
          name: v.name,
          email: v.email,
          avatar: v.avatar,
          city: v.city,
          points: v.points,
          hoursContributed: v.hoursContributed,
          badges: v.badges,
          completedTasks: completedTasksCount,
          joinedProjects: joinedProjectsCount,
        };
      })
    );

    // Top Projects by Impact Score
    const topProjects = await Project.find({ status: { $in: ['active', 'completed'] } })
      .select('title category location impactScore progress members averageRating image')
      .populate('createdBy', 'name email avatar')
      .sort({ impactScore: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      leaderboard: volunteersWithStats,
      topProjects: topProjects.map((p, index) => ({
        rank: index + 1,
        id: p._id,
        title: p.title,
        category: p.category,
        location: p.location,
        impactScore: p.impactScore,
        progress: p.progress,
        volunteersCount: p.members ? p.members.length : 0,
        averageRating: p.averageRating,
        image: p.image,
        manager: p.createdBy ? p.createdBy.name : 'Unknown',
      })),
    });
  } catch (error) {
    next(error);
  }
};
