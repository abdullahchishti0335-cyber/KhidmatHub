import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';

import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Sync scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, selectedProjectId]);

  const navigateToProject = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentTab('project_details');
  };

  const handleToastNavigate = (link) => {
    if (link?.startsWith('/projects/')) {
      const pId = link.replace('/projects/', '');
      navigateToProject(pId);
    } else if (link === '/admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-saylani-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setTab={(tab) => {
          if (tab !== 'project_details') setSelectedProjectId(null);
          setCurrentTab(tab);
        }}
        navigateToProject={navigateToProject}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'home' && (
          <HomePage setTab={setCurrentTab} navigateToProject={navigateToProject} />
        )}

        {currentTab === 'projects' && (
          <ProjectsPage setTab={setCurrentTab} navigateToProject={navigateToProject} />
        )}

        {currentTab === 'project_details' && (
          <ProjectDetailsPage
            projectId={selectedProjectId}
            onBack={() => setCurrentTab('projects')}
            setTab={setCurrentTab}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage setTab={setCurrentTab} navigateToProject={navigateToProject} />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardPage navigateToProject={navigateToProject} />
        )}

        {currentTab === 'admin' && (
          <AdminPage navigateToProject={navigateToProject} setTab={setCurrentTab} />
        )}

        {currentTab === 'login' && <LoginPage setTab={setCurrentTab} />}

        {currentTab === 'register' && <RegisterPage setTab={setCurrentTab} />}

        {currentTab === 'profile' && <ProfilePage />}
      </main>

      {/* Real-Time Toast Notifications */}
      <Toast onNavigate={handleToastNavigate} />

      {/* Footer */}
      <Footer setTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
