import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  UserCheck,
  UserX,
  Star,
} from 'lucide-react';
import { StatsCard, Badge, ProgressBar } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, applicationAPI } from '../../services/api';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export const ManagerDashboard = ({ navigateToProject }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getProjects({ limit: 100 });
      if (res.data?.success) {
        // Filter projects created by this manager (or all if admin)
        const myProjects = res.data.projects.filter(
          (p) => (p.createdBy?._id || p.createdBy) === (user?.id || user?._id)
        );
        setProjects(myProjects);

        // Fetch applications for all managed projects
        const allApps = [];
        for (const proj of myProjects) {
          try {
            const appRes = await applicationAPI.getProjectApplications(proj._id);
            if (appRes.data?.success) {
              const pendingOnly = appRes.data.applications
                .filter((a) => a.status === 'pending')
                .map((a) => ({ ...a, projectTitle: proj.title }));
              allApps.push(...pendingOnly);
            }
          } catch (e) {
            // Ignore per-project application error
          }
        }
        setPendingApps(allApps);
      }
    } catch (err) {
      console.error('Error loading manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (appId, status) => {
    try {
      await applicationAPI.reviewApplication(appId, {
        status,
        feedback: feedbackText || (status === 'approved' ? 'Welcome to the team!' : 'Positions filled.'),
      });
      setFeedbackText('');
      setReviewingId(null);
      await loadManagerData();
    } catch (err) {
      console.error('Error reviewing application:', err);
    }
  };

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const totalVolunteersCount = projects.reduce(
    (acc, p) => acc + (p.members ? p.members.length : 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Create Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Project Manager Portal
              </h2>
              <Badge variant="warning" size="sm">
                Coordinator
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Lead: <strong>{user?.name}</strong> • Saylani Regional Operations
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-xl">
              Create campaigns, review volunteer applications, assign tasks with deadlines, and oversee live impact analytics.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-lg shadow-saylani-500/25 flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Managed Projects"
          value={projects.length}
          subtitle={`${activeProjectsCount} currently active`}
          icon={FolderKanban}
          color="emerald"
        />
        <StatsCard
          title="Total Volunteers"
          value={totalVolunteersCount}
          subtitle="Mobilized team members"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Pending Applications"
          value={pendingApps.length}
          subtitle="Awaiting your approval"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Average Rating"
          value="4.8 / 5.0"
          subtitle="Volunteer satisfaction"
          icon={Star}
          color="purple"
        />
      </div>

      {/* Pending Applications Review Queue */}
      {pendingApps.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Pending Volunteer Applications ({pendingApps.length})</span>
            </h3>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Requires Action
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApps.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        app.applicant?.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={app.applicant?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{app.applicant?.name}</h4>
                      <p className="text-xs text-slate-400">
                        {app.applicant?.email} • {app.applicant?.city}
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">
                    {app.applicant?.points || 0} pts
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-saylani-400">
                    Applying for: {app.projectTitle}
                  </p>
                  <p className="italic">"{app.motivation}"</p>
                  {app.skills?.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Skills: {app.skills.join(', ')}
                    </p>
                  )}
                </div>

                {/* Approve / Reject Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleReviewApplication(app._id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleReviewApplication(app._id, 'approved')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 flex items-center gap-1 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve (+10 pts)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Progress Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Project Progress & Impact Summary
        </h3>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No projects created yet. Launch your first project above!
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{p.title}</h4>
                      <Badge variant="default" size="sm">
                        {p.category}
                      </Badge>
                      <Badge variant={p.status === 'completed' ? 'purple' : 'success'} size="sm">
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Location: {p.location} • Volunteers: {p.members ? p.members.length : 0} /{' '}
                      {p.requiredVolunteers}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Impact Score</span>
                      <span className="text-sm font-extrabold text-amber-400">
                        🌟 {p.impactScore?.toLocaleString() || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => navigateToProject(p._id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Task Execution Progress</span>
                    <span className="font-semibold text-white">{p.progress || 0}%</span>
                  </div>
                  <ProgressBar progress={p.progress || 0} height="h-2.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={() => loadManagerData()}
      />
    </div>
  );
};
