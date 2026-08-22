import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendNotificationToUser, broadcastGlobal } from '../config/socket.js';

// Helper to calculate and persist Project Impact Score
export const recalculateImpactScore = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return 0;

    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: 'COMPLETED',
    });

    const volunteersCount = project.members ? project.members.length : 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Impact Score Formula:
    // (Volunteers * Completed Tasks * Progress%) + (Rating * 100) + base factor
    const ratingBonus = Math.round((project.averageRating || 0) * 100);
    const score = Math.round(
      volunteersCount * (completedTasks + 1) * (progress / 10 || 1) * 10 + ratingBonus
    );

    project.progress = progress;
    project.impactScore = Math.max(score, volunteersCount * 25);
    await project.save();

    return project.impactScore;
  } catch (error) {
    console.error('Error recalculating impact score:', error.message);
    return 0;
  }
};

// @desc    Create a new project
// @route   POST /api/v1/projects
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      requiredVolunteers,
      skillsRequired,
    } = req.body;

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    let parsedSkills = [];
    if (skillsRequired) {
      if (Array.isArray(skillsRequired)) {
        parsedSkills = skillsRequired;
      } else if (typeof skillsRequired === 'string') {
        try {
          parsedSkills = JSON.parse(skillsRequired);
        } catch {
          parsedSkills = skillsRequired.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    // Default status: Admins create as active, Managers create as pending_approval or active
    // For good hackathon demo UX, managers can have active status or pending_approval
    const initialStatus = req.user.role === 'admin' ? 'active' : 'active'; // Default active or pending_approval

    const project = await Project.create({
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      requiredVolunteers: Number(requiredVolunteers) || 10,
      skillsRequired: parsedSkills,
      image,
      status: initialStatus,
      createdBy: req.user._id,
      members: [],
      impactScore: 100, // Initial seed score
    });

    // Notify all admins if status is pending_approval
    if (project.status === 'pending_approval') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        const notif = await Notification.create({
          recipient: admin._id,
          sender: req.user._id,
          type: 'system',
          title: 'New Project Submitted for Approval',
          message: `${req.user.name} submitted "${project.title}" for approval.`,
          link: `/admin`,
        });
        sendNotificationToUser(admin._id, notif);
      }
    }

    broadcastGlobal('project_created', project);

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects with search, filter, and sort
// @route   GET /api/v1/projects
export const getProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      status,
      skills,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Filter by status (default: show active and completed for discovery unless specified)
    if (status && status !== 'all') {
      query.status = status;
    } else if (!req.user || req.user.role === 'student') {
      // Students see active & completed projects
      query.status = { $in: ['active', 'completed'] };
    }

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Location / City (case-insensitive regex)
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by Skills Required
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim());
      query.skillsRequired = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }

    // Search by Keyword in title, description, location, or skills
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { skillsRequired: searchRegex },
      ];
    }

    // Sorting Options
    let sortOptions = { createdAt: -1 }; // default newest
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'most_volunteers') {
      sortOptions = { requiredVolunteers: -1 };
    } else if (sortBy === 'nearest_deadline') {
      sortOptions = { endDate: 1 };
    } else if (sortBy === 'highest_impact') {
      sortOptions = { impactScore: -1 };
    } else if (sortBy === 'highest_rated') {
      sortOptions = { averageRating: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('createdBy', 'name email role avatar')
      .populate('members', 'name email avatar points')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details by ID
// @route   GET /api/v1/projects/:id
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role avatar bio')
      .populate('members', 'name email avatar points city badges');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found with the specified ID.',
      });
    }

    // Calculate live task metrics
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: 'COMPLETED',
    });
    const inProgressTasks = await Task.countDocuments({
      project: project._id,
      status: 'IN_PROGRESS',
    });
    const todoTasks = await Task.countDocuments({
      project: project._id,
      status: 'TODO',
    });

    res.status(200).json({
      success: true,
      project,
      taskMetrics: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is project owner or admin
    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this project.',
      });
    }

    const {
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      requiredVolunteers,
      skillsRequired,
      status,
    } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (location) project.location = location;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (requiredVolunteers) project.requiredVolunteers = Number(requiredVolunteers);
    if (status) project.status = status;

    if (skillsRequired) {
      if (Array.isArray(skillsRequired)) {
        project.skillsRequired = skillsRequired;
      } else if (typeof skillsRequired === 'string') {
        try {
          project.skillsRequired = JSON.parse(skillsRequired);
        } catch {
          project.skillsRequired = skillsRequired.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (req.file) {
      project.image = `/uploads/${req.file.filename}`;
    }

    await project.save();
    await recalculateImpactScore(project._id);

    broadcastGlobal('project_updated', project);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this project.',
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ project: req.params.id });

    broadcastGlobal('project_deleted', { id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
