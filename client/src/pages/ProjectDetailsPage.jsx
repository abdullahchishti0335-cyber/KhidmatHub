import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  Layers,
  MessageSquare,
  Award,
  Trash2,
  Edit,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { projectAPI, taskAPI } from '../services/api';
import { Badge, ProgressBar, StatsCard } from '../components/common/Badge';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { DiscussionThread } from '../components/discussion/DiscussionThread';
import { ReviewsSection } from '../components/reviews/ReviewsSection';
import { ApplyModal } from '../components/projects/ApplyModal';
import { useAuth } from '../context/AuthContext';

export const ProjectDetailsPage = ({ projectId, onBack, setTab }) => {
  const { user, isAuthenticated, isStudent, isManager, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskMetrics, setTaskMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban'); // 'overview' | 'kanban' | 'discussion' | 'reviews' | 'impact'
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectAPI.getProjectById(projectId),
        taskAPI.getProjectTasks(projectId),
      ]);

      if (projRes.data?.success) {
        setProject(projRes.data.project);
        setTaskMetrics(projRes.data.taskMetrics);
      }
      if (tasksRes.data?.success) {
        setTasks(tasksRes.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-saylani-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading project workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Project Not Found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const isProjectManager =
    (project.createdBy?._id || project.createdBy) === (user?.id || user?._id);
  const isMember = project.members?.some(
    (m) => (m._id || m) === (user?.id || user?._id)
  );
  const isManagerOrAdmin = isProjectManager || isAdmin;

  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${project.title}"?`)) return;
    try {
      await projectAPI.deleteProject(project._id);
      onBack();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Back button & Manager Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        {isManagerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteProject}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Project Hero Banner */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 relative">
        <div className="relative h-64 sm:h-72 w-full bg-slate-950">
          <img
            src={
              project.image ||
              'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1200'
            }
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Floating Category & Impact Score Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Badge variant="primary" size="lg">
              {project.category}
            </Badge>

            <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/50 text-amber-300 text-sm font-extrabold shadow-lg shadow-amber-500/15">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Impact Score: {project.impactScore?.toLocaleString() || 0}</span>
            </div>
          </div>

          {/* Title & Metadata on Image */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-slate-700/50">
                <MapPin className="w-3.5 h-3.5 text-saylani-400" />
                {project.location}
              </span>
              <Badge variant={project.status === 'completed' ? 'purple' : 'success'} size="sm">
                {project.status?.toUpperCase()}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {project.title}
            </h1>
          </div>
        </div>

        {/* Action & Stats strip */}
        <div className="p-6 sm:p-8 bg-slate-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-saylani-400" />
              <span>
                <strong>{project.members ? project.members.length : 0}</strong> /{' '}
                {project.requiredVolunteers} Volunteers
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>
                {new Date(project.startDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                -{' '}
                {new Date(project.endDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-bold">
                {project.averageRating ? project.averageRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-slate-400">({project.totalReviews || 0} reviews)</span>
            </div>
          </div>

          {/* Join / Status Action */}
          <div>
            {isMember ? (
              <div className="flex items-center gap-2 text-xs font-bold text-saylani-400 bg-saylani-500/10 border border-saylani-500/30 px-4 py-2.5 rounded-2xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are an Approved Team Member</span>
              </div>
            ) : isStudent && project.status === 'active' ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) setTab('login');
                  else setApplyModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-xl shadow-saylani-500/25 transition-all transform hover:-translate-y-0.5"
              >
                Apply to Join Project (+10 pts) 🚀
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'kanban'
              ? 'bg-saylani-500 text-slate-950 shadow-md shadow-saylani-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Task Board ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('discussion')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'discussion'
              ? 'bg-saylani-500 text-slate-950 shadow-md shadow-saylani-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discussion & Updates</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-saylani-500 text-slate-950 shadow-md shadow-saylani-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Overview & Team</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'reviews'
              ? 'bg-saylani-500 text-slate-950 shadow-md shadow-saylani-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews & Ratings</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'impact'
              ? 'bg-saylani-500 text-slate-950 shadow-md shadow-saylani-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Impact Formula</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'kanban' && (
          <KanbanBoard
            projectId={project._id}
            tasks={tasks}
            members={project.members || []}
            isManagerOrAdmin={isManagerOrAdmin}
            onTasksUpdated={loadProjectData}
          />
        )}

        {activeTab === 'discussion' && <DiscussionThread projectId={project._id} />}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Project Info */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  About This Initiative
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Skills required */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Skills In Demand
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired?.map((sk, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-900 border border-slate-700 text-saylani-300 text-xs font-semibold rounded-xl"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Roster */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-saylani-400" />
                  <span>Approved Volunteer Team ({project.members?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.members?.map((member) => (
                    <div
                      key={member._id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3"
                    >
                      <img
                        src={
                          member.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                        }
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {member.city || 'Volunteer'} • {member.points || 0} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Manager Card & Quick Stats */}
            <div className="space-y-6">
              {/* Project Manager Card */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Project Lead
                </h4>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      project.createdBy?.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
                    }
                    alt={project.createdBy?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {project.createdBy?.name}
                    </h5>
                    <p className="text-xs text-slate-400">{project.createdBy?.email}</p>
                    <Badge variant="warning" size="sm" className="mt-1">
                      Project Coordinator
                    </Badge>
                  </div>
                </div>
                {project.createdBy?.bio && (
                  <p className="text-xs text-slate-400 italic">
                    "{project.createdBy.bio}"
                  </p>
                )}
              </div>

              {/* Progress Summary Card */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Milestone Progress
                </h4>
                <ProgressBar progress={project.progress || 0} showLabel={true} height="h-3" />
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 block">To Do</span>
                    <strong className="text-sm text-white">
                      {taskMetrics?.todo || 0}
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 block">In Progress</span>
                    <strong className="text-sm text-sky-400">
                      {taskMetrics?.inProgress || 0}
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 block">Completed</span>
                    <strong className="text-sm text-saylani-400">
                      {taskMetrics?.completed || 0}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewsSection
            projectId={project._id}
            isMember={isMember}
            averageRating={project.averageRating}
            totalReviews={project.totalReviews}
          />
        )}

        {activeTab === 'impact' && (
          <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Impact Score Algorithm
                </h3>
                <p className="text-xs text-slate-400">
                  Transparent formula used to calculate community value and rankings.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs sm:text-sm text-slate-200">
              <p className="text-amber-400 font-bold">
                Impact Score = (Volunteers × (Completed Tasks + 1) × Progress%) + (Rating × 100)
              </p>
              <div className="pt-3 border-t border-slate-800 space-y-1 text-slate-400 text-xs">
                <p>• Volunteers Joined: <strong>{project.members?.length || 0}</strong></p>
                <p>• Tasks Completed: <strong>{taskMetrics?.completed || 0}</strong></p>
                <p>• Execution Progress: <strong>{project.progress || 0}%</strong></p>
                <p>• Average Rating Bonus: <strong>{project.averageRating || 5.0} × 100</strong></p>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                Total Calculated Project Impact Score
              </span>
              <span className="text-4xl font-black text-amber-400 tracking-tight">
                🌟 {project.impactScore?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        project={project}
        onApplied={() => loadProjectData()}
      />
    </div>
  );
};
