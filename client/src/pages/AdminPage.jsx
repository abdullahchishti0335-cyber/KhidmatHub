import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { ShieldAlert } from 'lucide-react';

export const AdminPage = ({ navigateToProject, setTab }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-400">
          This portal is strictly reserved for platform super-administrators.
        </p>
        <button
          onClick={() => setTab('home')}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  return <AdminDashboard navigateToProject={navigateToProject} setTab={setTab} />;
};
