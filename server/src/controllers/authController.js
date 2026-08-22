import User from '../models/User.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';

// Helper to calculate badges
export const evaluateBadges = (points, tasksCompleted, projectsJoined) => {
  const badges = ['Impact Pioneer'];
  if (points >= 100) badges.push('Active Contributor');
  if (tasksCompleted >= 5) badges.push('Task Master');
  if (points >= 500) badges.push('Community Hero');
  if (projectsJoined >= 3) badges.push('Veteran Volunteer');
  if (points >= 1000) badges.push('Legendary Impact Maker');
  return badges;
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, skills, role, bio } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    let avatar = '';
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    let parsedSkills = [];
    if (skills) {
      if (Array.isArray(skills)) {
        parsedSkills = skills;
      } else if (typeof skills === 'string') {
        try {
          parsedSkills = JSON.parse(skills);
        } catch {
          parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      city: city || 'Karachi',
      skills: parsedSkills,
      role: role && ['student', 'manager'].includes(role) ? role : 'student',
      bio: bio || 'Excited to contribute to community impact initiatives.',
      avatar,
      points: 20, // Welcome signup bonus
      badges: ['Impact Pioneer'],
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        skills: user.skills,
        bio: user.bio,
        avatar: user.avatar,
        points: user.points,
        hoursContributed: user.hoursContributed,
        status: user.status,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administrators.',
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        skills: user.skills,
        bio: user.bio,
        avatar: user.avatar,
        points: user.points,
        hoursContributed: user.hoursContributed,
        status: user.status,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick 1-Click Demo Login for fast testing/evaluation
// @route   POST /api/v1/auth/demo-login
export const demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body;
    let targetEmail = 'student@impacthub.pk';
    if (role === 'manager') targetEmail = 'manager@impacthub.pk';
    if (role === 'admin') targetEmail = 'admin@impacthub.pk';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      // Find any user with that role
      user = await User.findOne({ role });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user for role '${role}' not found. Please run database seed.`,
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        skills: user.skills,
        bio: user.bio,
        avatar: user.avatar,
        points: user.points,
        hoursContributed: user.hoursContributed,
        status: user.status,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile with live stats
// @route   GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Compute live stats
    const [tasksCompletedCount, totalTasksAssigned, projectsJoinedCount, completedProjectsCount] =
      await Promise.all([
        Task.countDocuments({ assignedTo: user._id, status: 'COMPLETED' }),
        Task.countDocuments({ assignedTo: user._id }),
        Project.countDocuments({ members: user._id }),
        Project.countDocuments({ members: user._id, status: 'completed' }),
      ]);

    // Update badges dynamically
    const updatedBadges = evaluateBadges(user.points, tasksCompletedCount, projectsJoinedCount);
    if (JSON.stringify(updatedBadges) !== JSON.stringify(user.badges)) {
      user.badges = updatedBadges;
      await user.save();
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        skills: user.skills,
        bio: user.bio,
        avatar: user.avatar,
        points: user.points,
        hoursContributed: user.hoursContributed,
        status: user.status,
        badges: user.badges,
        stats: {
          tasksCompleted: tasksCompletedCount,
          totalTasks: totalTasksAssigned,
          projectsJoined: projectsJoinedCount,
          completedProjects: completedProjectsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, bio, skills } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (bio !== undefined) user.bio = bio;

    if (skills) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        try {
          user.skills = JSON.parse(skills);
        } catch {
          user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};
