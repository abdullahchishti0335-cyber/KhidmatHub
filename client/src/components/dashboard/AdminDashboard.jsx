import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  Search,
  UserCheck,
  UserX,
  Trash2,
  BarChart3,
  PieChart as PieIcon,
  Check,
  X,
} from 'lucide-react';
import { StatsCard, Badge } from '../common/Badge';
import { adminAPI, projectAPI } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ROLE_COLORS = {
  student: '#10b981',
  manager: '#f59e0b',
  admin: '#f43f5e',
};

const CATEGORY_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export const AdminDashboard = ({ navigateToProject }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, [selectedRoleFilter]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ role: selectedRoleFilter, search: userSearch }),
        projectAPI.getProjects({ status: 'pending_approval' }),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.users);
      if (projectsRes.data?.success) setPendingProjects(projectsRes.data.projects);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    loadAdminData();
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminAPI.toggleUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleProjectApproval = async (projectId, status) => {
    try {
      await adminAPI.reviewProject(projectId, status);
      setPendingProjects((prev) => prev.filter((p) => p._id !== projectId));
      loadAdminData();
    } catch (err) {
      console.error('Error reviewing project:', err);
    }
  };

  const roleChartData = stats
    ? [
        { name: 'Students', value: stats.users?.students || 0, fill: '#10b981' },
        { name: 'Managers', value: stats.users?.managers || 0, fill: '#f59e0b' },
        { name: 'Admins', value: stats.users?.admins || 0, fill: '#f43f5e' },
      ]
    : [];

  const categoryChartData = stats?.categoryBreakdown || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Saylani Platform Administration
            </h2>
            <Badge variant="danger" size="sm">
              Super Admin
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Global governance, user moderation, project approvals, and nationwide impact metrics.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.users?.total || 0}
          subtitle={`${stats?.users?.students || 0} volunteers`}
          icon={Users}
          color="emerald"
        />
        <StatsCard
          title="Total Projects"
          value={stats?.projects?.total || 0}
          subtitle={`${stats?.projects?.active || 0} active • ${stats?.projects?.completed || 0} completed`}
          icon={FolderKanban}
          color="blue"
        />
        <StatsCard
          title="Tasks Completed"
          value={stats?.tasks?.completed || 0}
          subtitle={`${stats?.tasks?.completionRate || 0}% overall completion`}
          icon={CheckCircle2}
          color="purple"
        />
        <StatsCard
          title="Platform Impact Score"
          value={stats?.platformImpactScore?.toLocaleString() || 0}
          subtitle="Cumulative community points"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-saylani-400" />
            <span>Users by Role Distribution</span>
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects by Category Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-sky-400" />
            <span>Projects by Impact Category</span>
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Project Approval Queue */}
      {pendingProjects.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Pending Project Submissions ({pendingProjects.length})</span>
            </h3>
            <Badge variant="warning" size="sm">
              Approval Queue
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingProjects.map((proj) => (
              <div
                key={proj._id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                    <Badge variant="default" size="sm">
                      {proj.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Location: {proj.location} • Volunteers: {proj.requiredVolunteers}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleProjectApproval(proj._id, 'cancelled')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleProjectApproval(proj._id, 'active')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Launch 🚀</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Governance & Moderation Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              User Management & Moderation
            </h3>
            <p className="text-xs text-slate-400">
              Manage permissions, toggle account suspension, and view activity points.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleUserSearch} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-saylani-500"
              />
            </form>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-saylani-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="manager">Managers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <img
                      src={
                        u.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={u.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-500">{u.email}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-slate-400">{u.city || 'Pakistan'}</td>

                  <td className="py-3 px-4 font-bold text-amber-400">{u.points || 0}</td>

                  <td className="py-3 px-4">
                    <Badge variant={u.status === 'active' ? 'success' : 'danger'} size="sm">
                      {u.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u._id, u.status)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                        u.status === 'active'
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                          : 'text-saylani-400 bg-saylani-500/10 border-saylani-500/30 hover:bg-saylani-500/20'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
