import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendNotificationToUser, broadcastToProject } from '../config/socket.js';
import { recalculateImpactScore } from './projectController.js';

// @desc    Create a new task for a project
// @route   POST /api/v1/tasks
export const createTask = async (req, res, next) => {
  try {
    const { projectId, title, description, assignedTo, priority, deadline } = req.body;

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
        message: 'Only the Project Manager or Admin can assign tasks.',
      });
    }

    // Verify assigned user is a member or PM
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Assigned user not found.' });
    }

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      assignedTo,
      priority: priority || 'MEDIUM',
      deadline,
      status: 'TODO',
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Notify assigned student
    const notif = await Notification.create({
      recipient: assignedTo,
      sender: req.user._id,
      type: 'task_assigned',
      title: 'New Task Assigned 📋',
      message: `You were assigned task "${title}" in "${project.title}". Priority: ${priority || 'MEDIUM'}.`,
      link: `/projects/${project._id}`,
    });
    sendNotificationToUser(assignedTo, notif);

    // Recalculate project impact score
    await recalculateImpactScore(projectId);

    // Broadcast to project room
    broadcastToProject(projectId, 'task_created', populatedTask);

    res.status(201).json({
      success: true,
      message: 'Task created and assigned successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/v1/tasks/project/:projectId
export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email avatar skills points')
      .populate('createdBy', 'name email avatar')
      .sort({ deadline: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to logged-in user
// @route   GET /api/v1/tasks/my
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'title category location status endDate image')
      .populate('createdBy', 'name email avatar')
      .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (Kanban move) & completion evidence
// @route   PUT /api/v1/tasks/:id/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, completionNotes, attachmentUrl } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status. Allowed: TODO, IN_PROGRESS, COMPLETED',
      });
    }

    const task = await Task.findById(req.params.id)
      .populate('project')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Authorization: Must be assigned user, project creator, or admin
    const isAssignee = task.assignedTo._id.toString() === req.user._id.toString();
    const isManager = task.project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAssignee && !isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task.',
      });
    }

    const previousStatus = task.status;
    task.status = status;

    if (completionNotes !== undefined) task.completionNotes = completionNotes;
    if (attachmentUrl !== undefined) task.attachmentUrl = attachmentUrl;

    if (req.file) {
      task.attachmentUrl = `/uploads/${req.file.filename}`;
    }

    // If marked completed for the first time, award +20 points
    if (status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      task.completedAt = new Date();
      await User.findByIdAndUpdate(task.assignedTo._id, {
        $inc: { points: 20, hoursContributed: 3 },
      });

      // Notify Project Manager
      const notif = await Notification.create({
        recipient: task.project.createdBy,
        sender: req.user._id,
        type: 'task_completed',
        title: 'Task Completed! ✅',
        message: `${task.assignedTo.name} completed task "${task.title}" in "${task.project.title}".`,
        link: `/projects/${task.project._id}`,
      });
      sendNotificationToUser(task.project.createdBy, notif);
    }

    await task.save();
    await recalculateImpactScore(task.project._id);

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar skills points')
      .populate('createdBy', 'name email avatar');

    broadcastToProject(task.project._id, 'task_updated', updatedTask);

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}.`,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (
      task.project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task.',
      });
    }

    const projectId = task.project._id;
    await Task.findByIdAndDelete(req.params.id);
    await recalculateImpactScore(projectId);

    broadcastToProject(projectId, 'task_deleted', { taskId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Task removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
