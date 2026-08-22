import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Paperclip,
  ArrowRight,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { taskAPI } from '../../services/api';
import { CreateTaskModal, CompleteTaskEvidenceModal } from './TaskModal';
import confetti from 'canvas-confetti';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'border-slate-700 bg-slate-900/50' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-sky-500/40 bg-sky-950/20' },
  { id: 'COMPLETED', label: 'Completed', color: 'border-saylani-500/40 bg-saylani-950/20' },
];

export const KanbanBoard = ({
  projectId,
  tasks = [],
  members = [],
  isManagerOrAdmin = false,
  onTasksUpdated,
}) => {
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTaskForComplete, setSelectedTaskForComplete] = useState(null);

  const handleStatusChange = async (task, newStatus) => {
    if (newStatus === 'COMPLETED') {
      setSelectedTaskForComplete(task);
      setCompleteModalOpen(true);
      return;
    }

    try {
      const res = await taskAPI.updateTaskStatus(task._id, { status: newStatus });
      if (res.data && res.data.success) {
        onTasksUpdated();
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleTaskCompleted = (updatedTask) => {
    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b'],
    });
    onTasksUpdated();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.deleteTask(taskId);
      onTasksUpdated();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const priorityStyles = {
    LOW: { variant: 'default', text: 'Low' },
    MEDIUM: { variant: 'info', text: 'Medium' },
    HIGH: { variant: 'warning', text: 'High' },
    URGENT: { variant: 'danger', text: 'Urgent ⚡' },
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Project Tasks Kanban</h3>
          <p className="text-xs text-slate-400">
            Track volunteer assignments, deadlines, and milestone completion progress.
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl p-4 border ${col.color} backdrop-blur-sm flex flex-col min-h-[450px]`}
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {col.label}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl p-4 text-center">
                    <p>No tasks in {col.label.toLowerCase()}</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isAssignee =
                      (task.assignedTo?._id || task.assignedTo) === (user?.id || user?._id);
                    const canEdit = isAssignee || isManagerOrAdmin;
                    const isOverdue =
                      new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

                    return (
                      <div
                        key={task._id}
                        className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-slate-700 space-y-3 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            variant={priorityStyles[task.priority]?.variant || 'default'}
                            size="sm"
                          >
                            {priorityStyles[task.priority]?.text || task.priority}
                          </Badge>

                          {isManagerOrAdmin && (
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-white group-hover:text-saylani-300 transition-colors">
                            {task.title}
                          </h5>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Completion Proof / Notes if available */}
                        {task.completionNotes && (
                          <div className="p-2 rounded-lg bg-saylani-500/10 border border-saylani-500/20 text-[11px] text-saylani-300">
                            <strong>Note:</strong> {task.completionNotes}
                          </div>
                        )}

                        {task.attachmentUrl && (
                          <a
                            href={task.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>View Attachment</span>
                          </a>
                        )}

                        {/* Assignee & Deadline footer */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          {/* Assignee */}
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                task.assignedTo?.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                              }
                              alt={task.assignedTo?.name || 'Assignee'}
                              className="w-6 h-6 rounded-full object-cover border border-slate-600"
                            />
                            <span className="text-xs text-slate-300 font-medium truncate max-w-[90px]">
                              {task.assignedTo?.name?.split(' ')[0] || 'Member'}
                            </span>
                          </div>

                          {/* Deadline */}
                          <div
                            className={`flex items-center gap-1 text-[11px] font-semibold ${
                              isOverdue ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(task.deadline).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Move / Update Action Buttons */}
                        {canEdit && (
                          <div className="pt-1 flex items-center justify-end gap-1.5">
                            {task.status === 'TODO' && (
                              <button
                                onClick={() => handleStatusChange(task, 'IN_PROGRESS')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors flex items-center gap-1"
                              >
                                <span>Start</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {task.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleStatusChange(task, 'COMPLETED')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-saylani-500 text-slate-950 hover:bg-saylani-400 transition-colors flex items-center gap-1 shadow-sm shadow-saylani-500/20"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            )}

                            {task.status === 'COMPLETED' && (
                              <div className="text-[11px] font-bold text-saylani-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>+20 pts earned</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projectId={projectId}
        members={members}
        onTaskCreated={onTasksUpdated}
      />

      <CompleteTaskEvidenceModal
        isOpen={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setSelectedTaskForComplete(null);
        }}
        task={selectedTaskForComplete}
        onTaskCompleted={handleTaskCompleted}
      />
    </div>
  );
};
