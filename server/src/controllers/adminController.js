import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { sendNotificationToUser, broadcastGlobal } from '../config/socket.js';

// @desc    Get complete administrative analytics and metrics
// @route   GET /api/v1/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentsCount,
      managersCount,
      adminsCount,
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalTasks,
      completedTasks,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'admin' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'pending_approval' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'COMPLETED' }),
      Application.countDocuments(),
    ]);

    // Aggregate projects by Category
    const categoryStats = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalImpact: { $sum: '$impactScore' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Aggregate total impact score across platform
    const impactAggregation = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalImpactScore: { $sum: '$impactScore' },
        },
      },
    ]);

    const totalPlatformImpact =
      impactAggregation.length > 0 ? impactAggregation[0].totalImpactScore : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: studentsCount,
          managers: managersCount,
          admins: adminsCount,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          pending: pendingProjects,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate:
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        applications: {
          total: totalApplications,
        },
        platformImpactScore: totalPlatformImpact,
        categoryBreakdown: categoryStats.map((c) => ({
          category: c._id || 'Other',
          count: c.count,
          totalImpact: c.totalImpact,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering and search
// @route   GET /api/v1/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 25 } = req.query;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { city: searchRegex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or activate a user
// @route   PUT /api/v1/admin/users/:id/status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: active, suspended',
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own administrative status.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role
// @route   PUT /api/v1/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['student', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed values: student, manager, admin',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a submitted project
// @route   PUT /api/v1/admin/projects/:id/review
export const reviewPendingProject = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' or 'cancelled'

    if (!['active', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active (approved) or cancelled (rejected).',
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.status = status;
    await project.save();

    // Notify Project Manager
    const notif = await Notification.create({
      recipient: project.createdBy,
      sender: req.user._id,
      type: status === 'active' ? 'project_approved' : 'project_rejected',
      title: status === 'active' ? 'Project Approved! 🚀' : 'Project Rejected',
      message:
        status === 'active'
          ? `Your project "${project.title}" has been approved by the Admin and is now live!`
          : `Your project "${project.title}" was not approved.`,
      link: `/projects/${project._id}`,
    });
    sendNotificationToUser(project.createdBy, notif);

    broadcastGlobal('project_updated', project);

    res.status(200).json({
      success: true,
      message: `Project ${status === 'active' ? 'approved' : 'rejected'} successfully.`,
      project,
    });
  } catch (error) {
    next(error);
  }
};
