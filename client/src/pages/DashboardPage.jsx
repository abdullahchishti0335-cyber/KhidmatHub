import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { ManagerDashboard } from '../components/dashboard/ManagerDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { LogIn } from 'lucide-react';

export const DashboardPage = ({ setTab, navigateToProject }) => {
  const { user, isAuthenticated, isStudent, isManager, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-saylani-500/20 text-saylani-400 border border-saylani-500/30 flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400">
          Please log in to access your role-specific project dashboard and tasks.
        </p>
        <button
          onClick={() => setTab('login')}
          className="px-6 py-2.5 rounded-xl bg-saylani-500 hover:bg-saylani-400 text-slate-950 font-bold text-xs shadow-lg shadow-saylani-500/20"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard navigateToProject={navigateToProject} setTab={setTab} />;
  }

  if (isManager) {
    return <ManagerDashboard navigateToProject={navigateToProject} setTab={setTab} />;
  }

  return <StudentDashboard navigateToProject={navigateToProject} setTab={setTab} />;
};
