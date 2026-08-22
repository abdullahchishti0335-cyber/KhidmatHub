import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Sparkles,
  ArrowRight,
  Compass,
  Trophy,
  Users,
  CheckCircle2,
  Calendar,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ApplyModal } from '../components/projects/ApplyModal';
import { projectAPI, leaderboardAPI } from '../services/api';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const HomePage = ({ setTab, navigateToProject }) => {
  const { isAuthenticated, demoLogin } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [selectedProjectForApply, setSelectedProjectForApply] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    // Load featured active projects
    projectAPI
      .getProjects({ limit: 3, sortBy: 'highest_impact' })
      .then((res) => {
        if (res.data?.success) setFeaturedProjects(res.data.projects);
      })
      .catch(console.error);

    // Load top contributors
    leaderboardAPI
      .getLeaderboard()
      .then((res) => {
        if (res.data?.success) setTopVolunteers(res.data.leaderboard.slice(0, 3));
      })
      .catch(console.error);
  }, []);

  const handleApplyClick = (project) => {
    if (!isAuthenticated) {
      setTab('login');
      return;
    }
    setSelectedProjectForApply(project);
    setApplyModalOpen(true);
  };

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 bg-saylani-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saylani-500/10 border border-saylani-500/30 text-saylani-300 text-xs sm:text-sm font-semibold animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Saylani Community Impact Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Empowering Youth to Drive <br className="hidden sm:inline" />
            <span className="gradient-text">Real Community Change</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ImpactHub brings students, project managers, and community leaders together. Create initiatives, recruit volunteers, collaborate on real-time Kanban boards, and track transparent impact scores.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setTab('projects')}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-xl shadow-saylani-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Impact Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTab('leaderboard')}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Leaderboard</span>
            </button>
          </div>

          {/* Hackathon Fast Evaluation Bar */}
          {!isAuthenticated && (
            <div className="pt-6">
              <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    ⚡ Fast Hackathon Review Logins
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Instant 1-click login into any role to evaluate features:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      demoLogin('student');
                      setTab('dashboard');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  >
                    Student
                  </button>
                  <button
                    onClick={() => {
                      demoLogin('manager');
                      setTab('dashboard');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  >
                    Manager
                  </button>
                  <button
                    onClick={() => {
                      demoLogin('admin');
                      setTab('admin');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Platform Highlight Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">25,000+</p>
          <p className="text-xs uppercase tracking-wider font-semibold text-saylani-400">
            Student Volunteers
          </p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">450+</p>
          <p className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            Community Campaigns
          </p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">120,000+</p>
          <p className="text-xs uppercase tracking-wider font-semibold text-amber-400">
            Beneficiaries Reached
          </p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">98.4%</p>
          <p className="text-xs uppercase tracking-wider font-semibold text-purple-400">
            Volunteer Satisfaction
          </p>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured High-Impact Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Active campaigns making a measurable difference in urban and rural Pakistan.
            </p>
          </div>

          <button
            onClick={() => setTab('projects')}
            className="text-xs sm:text-sm font-semibold text-saylani-400 hover:text-saylani-300 flex items-center gap-1 group"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onSelect={(id) => navigateToProject(id)}
              onApply={handleApplyClick}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How ImpactHub Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A transparent 4-step pipeline from campaign discovery to verified impact reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-saylani-500/40 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-saylani-500/20 text-saylani-400 border border-saylani-500/30 flex items-center justify-center text-xs font-black">
              01
            </span>
            <h4 className="text-sm font-bold text-white">Discover & Apply</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore campaigns filtered by category, city, required skills, and deadlines. Apply with 1 click.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-sky-500/40 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-black">
              02
            </span>
            <h4 className="text-sm font-bold text-white">Join Team & Get Tasks</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Project Managers approve applications and assign tasks with priority and clear deadlines.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-amber-500/40 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black">
              03
            </span>
            <h4 className="text-sm font-bold text-white">Collaborate on Kanban</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Update task status (TODO $\rightarrow$ IN PROGRESS $\rightarrow$ COMPLETED), upload evidence, and chat in real-time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-purple-500/40 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-black">
              04
            </span>
            <h4 className="text-sm font-bold text-white">Earn Impact Score</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accumulate points, unlock badges, climb the national leaderboard, and leave peer reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Top Contributors Podium Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-400" />
              <span>Top Volunteer Impact Makers</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Recognizing the most dedicated student contributors across Pakistan.
            </p>
          </div>

          <button
            onClick={() => setTab('leaderboard')}
            className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Full Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topVolunteers.map((vol, idx) => (
            <div
              key={vol.id}
              className={`glass-card p-6 rounded-2xl border space-y-4 text-center relative ${
                idx === 0
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent'
                  : 'border-slate-800'
              }`}
            >
              <div className="absolute top-4 right-4">
                <span className="text-xl">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
              </div>

              <img
                src={
                  vol.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
                }
                alt={vol.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-slate-600 shadow-md"
              />

              <div>
                <h4 className="text-base font-bold text-white">{vol.name}</h4>
                <p className="text-xs text-slate-400">{vol.city || 'Karachi, Pakistan'}</p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <span className="font-extrabold text-amber-400 text-lg block">
                  {vol.points?.toLocaleString() || 0} pts
                </span>
                <span className="text-slate-400 text-[11px]">
                  {vol.completedTasks || 0} tasks completed • {vol.hoursContributed || 0} hrs
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedProjectForApply(null);
        }}
        project={selectedProjectForApply}
        onApplied={() => {
          projectAPI.getProjects({ limit: 3 }).then((res) => {
            if (res.data?.success) setFeaturedProjects(res.data.projects);
          });
        }}
      />
    </div>
  );
};
