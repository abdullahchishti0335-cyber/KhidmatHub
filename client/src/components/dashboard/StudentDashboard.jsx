import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Send,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { StatsCard, Badge, ProgressBar } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { taskAPI, applicationAPI, projectAPI } from '../../services/api';
import { CompleteTaskEvidenceModal } from '../kanban/TaskModal';

export const StudentDashboard = ({ setTab, navigateToProject }) => {
  const { user, refreshProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [tasksRes, appsRes, projectsRes] = await Promise.all([
        taskAPI.getMyTasks(),
        applicationAPI.getMyApplications(),
        projectAPI.getProjects({ limit: 100 }),
      ]);

      if (tasksRes.data?.success) setTasks(tasksRes.data.tasks);
      if (appsRes.data?.success) setApplications(appsRes.data.applications);

      if (projectsRes.data?.success) {
        const myProjects = projectsRes.data.projects.filter((p) =>
          p.members?.some((m) => (m._id || m) === (user?.id || user?._id))
        );
        setJoinedProjects(myProjects);
      }
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusToggle = async (task, newStatus) => {
    if (newStatus === 'COMPLETED') {
      setSelectedTask(task);
      setCompleteModalOpen(true);
      return;
    }

    try {
      await taskAPI.updateTaskStatus(task._id, { status: newStatus });
      await loadStudentData();
      refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100;

  const completedProjectsCount = joinedProjects.filter((p) => p.status === 'completed').length;
  const projectCompletionRate =
    joinedProjects.length > 0
      ? Math.round((completedProjectsCount / joinedProjects.length) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-saylani-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-saylani-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
              }
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-saylani-500/50 shadow-lg shadow-saylani-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, {user?.name}!
                </h2>
                <Badge variant="primary" size="sm">
                  Volunteer
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                City: <strong>{user?.city || 'Pakistan'}</strong> • Level:{' '}
                <strong className="text-amber-400">
                  {user?.points >= 1000 ? 'Champion Contributor' : 'Active Volunteer'}
                </strong>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {user?.badges?.map((b, i) => (
                  <Badge key={i} variant="gold" size="sm">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>{b}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setTab('projects')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-lg shadow-saylani-500/25 flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <span>Explore New Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Projects Joined"
          value={joinedProjects.length}
          subtitle={`${completedProjectsCount} completed`}
          icon={FolderKanban}
          color="emerald"
        />
        <StatsCard
          title="Tasks Completed"
          value={completedTasksCount}
          subtitle={`Out of ${totalTasksCount} assigned`}
          icon={CheckCircle2}
          color="blue"
        />
        <StatsCard
          title="Hours Contributed"
          value={`${user?.hoursContributed || 0} hrs`}
          subtitle="Community service hours"
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Impact Points"
          value={user?.points || 0}
          subtitle="Volunteer rating score"
          icon={Trophy}
          color="amber"
        />
      </div>

      {/* Progress Charts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Assigned Tasks Completion</span>
            </h4>
            <span className="text-xs font-extrabold text-sky-400">
              {taskCompletionRate}%
            </span>
          </div>
          <ProgressBar progress={taskCompletionRate} color="blue" height="h-3" />
          <p className="text-[11px] text-slate-400">
            {completedTasksCount} of {totalTasksCount} tasks completed. Keep up the great work!
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-saylani-400" />
              <span>Projects Completion Rate</span>
            </h4>
            <span className="text-xs font-extrabold text-saylani-400">
              {projectCompletionRate}%
            </span>
          </div>
          <ProgressBar progress={projectCompletionRate} color="saylani" height="h-3" />
          <p className="text-[11px] text-slate-400">
            {completedProjectsCount} of {joinedProjects.length} community projects concluded.
          </p>
        </div>
      </div>

      {/* Assigned Tasks Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              My Assigned Tasks
            </h3>
            <p className="text-xs text-slate-400">
              Update task progress or submit completion proof to earn +20 Activity Points.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No tasks currently assigned. Join projects to participate in tasks!
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.status === 'COMPLETED'
                          ? 'success'
                          : task.status === 'IN_PROGRESS'
                          ? 'info'
                          : 'default'
                      }
                      size="sm"
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Project: <strong>{task.project?.title || 'Community Project'}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-saylani-300 transition-colors">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {new Date(task.deadline).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>

                  {task.status === 'TODO' && (
                    <button
                      onClick={() => handleTaskStatusToggle(task, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30"
                    >
                      Start Task
                    </button>
                  )}

                  {task.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleTaskStatusToggle(task, 'COMPLETED')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete (+20 pts)</span>
                    </button>
                  )}

                  {task.status === 'COMPLETED' && (
                    <div className="text-xs font-bold text-saylani-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Completed ✅</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Applications Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          My Volunteer Applications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              You haven't submitted any applications yet.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                    {app.project?.title || 'Community Project'}
                  </h4>
                  <Badge
                    variant={
                      app.status === 'approved'
                        ? 'success'
                        : app.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {app.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  "{app.motivation || 'Excited to contribute.'}"
                </p>
                {app.feedback && (
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    Feedback: {app.feedback}
                  </p>
                )}
                {app.status === 'approved' && app.project && (
                  <button
                    onClick={() => navigateToProject(app.project._id || app.project)}
                    className="text-xs font-semibold text-saylani-400 hover:text-saylani-300 flex items-center gap-1 pt-1"
                  >
                    <span>Go to project workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <CompleteTaskEvidenceModal
        isOpen={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskCompleted={() => {
          loadStudentData();
          refreshProfile();
        }}
      />
    </div>
  );
};
