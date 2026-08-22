import Application from '../models/Application.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendNotificationToUser, broadcastToProject } from '../config/socket.js';
import { recalculateImpactScore } from './projectController.js';

// @desc    Apply to join a project
// @route   POST /api/v1/applications
export const applyToProject = async (req, res, next) => {
  try {
    const { projectId, motivation, skills } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (project.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Applications are closed for this project.',
      });
    }

    // Check if already a member
    if (project.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You are already an approved member of this project.',
      });
    }

    // Check if duplicate application
    const existingApp = await Application.findOne({
      project: projectId,
      applicant: req.user._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: `You already submitted an application (Status: ${existingApp.status.toUpperCase()}).`,
      });
    }

    let parsedSkills = [];
    if (skills) {
      parsedSkills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      parsedSkills = req.user.skills || [];
    }

    const application = await Application.create({
      project: projectId,
      applicant: req.user._id,
      motivation: motivation || 'I am passionate about contributing to this initiative.',
      skills: parsedSkills,
      status: 'pending',
    });

    // Notify Project Manager
    const managerNotif = await Notification.create({
      recipient: project.createdBy,
      sender: req.user._id,
      type: 'application_received',
      title: 'New Volunteer Application',
      message: `${req.user.name} applied to join "${project.title}".`,
      link: `/projects/${project._id}`,
    });
    sendNotificationToUser(project.createdBy, managerNotif);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The Project Manager will review it.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's submitted applications
// @route   GET /api/v1/applications/my
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('project', 'title category location status startDate endDate image impactScore')
      .populate('reviewedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific project (PM / Admin)
// @route   GET /api/v1/applications/project/:projectId
export const getProjectApplications = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this project.',
      });
    }

    const applications = await Application.find({ project: projectId })
      .populate('applicant', 'name email phone city skills avatar points hoursContributed badges')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a volunteer application
// @route   PUT /api/v1/applications/:id/review
export const reviewApplication = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected".',
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('project')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const project = application.project;
    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review applications for this project.',
      });
    }

    application.status = status;
    application.feedback = feedback || '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    if (status === 'approved') {
      // Add applicant to project members if not already
      if (!project.members.some((m) => m.toString() === application.applicant._id.toString())) {
        project.members.push(application.applicant._id);
        await project.save();
      }

      // Award +10 points to student for joining
      await User.findByIdAndUpdate(application.applicant._id, {
        $inc: { points: 10, hoursContributed: 2 },
      });

      // Recalculate impact score
      await recalculateImpactScore(project._id);

      // Notification
      const notif = await Notification.create({
        recipient: application.applicant._id,
        sender: req.user._id,
        type: 'application_approved',
        title: 'Application Approved! 🎉',
        message: `Congratulations! Your application to join "${project.title}" has been approved.`,
        link: `/projects/${project._id}`,
      });
      sendNotificationToUser(application.applicant._id, notif);
    } else {
      // Notification for rejection
      const notif = await Notification.create({
        recipient: application.applicant._id,
        sender: req.user._id,
        type: 'application_rejected',
        title: 'Application Update',
        message: `Your application to join "${project.title}" was not accepted. ${feedback ? `Feedback: ${feedback}` : ''}`,
        link: `/projects/${project._id}`,
      });
      sendNotificationToUser(application.applicant._id, notif);
    }

    broadcastToProject(project._id, 'application_updated', {
      applicationId: application._id,
      status,
      applicant: application.applicant,
    });

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};
