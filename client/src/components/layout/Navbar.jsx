import React, { useState, useEffect, useRef } from 'react';
import {
  HeartHandshake,
  Compass,
  Trophy,
  LayoutDashboard,
  ShieldAlert,
  Bell,
  CheckCheck,
  LogOut,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/api';
import { Badge } from '../common/Badge';

export const Navbar = ({ currentTab, setTab, navigateToProject }) => {
  const { user, isAuthenticated, logout, demoLogin, isStudent, isManager, isAdmin } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const demoRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target)) {
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await notificationAPI.getMyNotifications();
      if (res.data && res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleToggleNotif = () => {
    if (!notifOpen) {
      loadNotifications();
    }
    setNotifOpen(!notifOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationAPI.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }
    setNotifOpen(false);
    if (notif.link) {
      if (notif.link.startsWith('/projects/')) {
        const pId = notif.link.replace('/projects/', '');
        navigateToProject(pId);
      } else if (notif.link === '/admin') {
        setTab('admin');
      } else {
        setTab('dashboard');
      }
    }
  };

  const handleDemoSwitch = async (role) => {
    setDemoMenuOpen(false);
    await demoLogin(role);
    setTab('dashboard');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saylani-600 via-saylani-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-saylani-500/25 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">Impact</span>
                <span className="text-xl font-black tracking-tight gradient-text">Hub</span>
              </div>
              <p className="text-[10px] text-saylani-400 font-semibold tracking-wider uppercase -mt-1">
                Saylani Community
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setTab('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-saylani-500/20 text-saylani-300 font-semibold border border-saylani-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setTab('projects')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'projects'
                  ? 'bg-saylani-500/20 text-saylani-300 font-semibold border border-saylani-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setTab('leaderboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'leaderboard'
                  ? 'bg-saylani-500/20 text-saylani-300 font-semibold border border-saylani-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-saylani-500/20 text-saylani-300 font-semibold border border-saylani-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2.5">
            {/* 1-Click Fast Demo Role Switcher */}
            <div className="relative" ref={demoRef}>
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/10"
                title="1-Click Fast Switch Demo Role for Testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Demo Switch</span>
                <span className="sm:hidden">Demo</span>
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-700 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Instant Demo Logins
                    </p>
                    <p className="text-[10px] text-slate-400">Switch roles with 1-click</p>
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <span className="font-semibold block">🎓 Student / Volunteer</span>
                      <span className="text-[10px] text-slate-400">Ali Khan (1,250 pts)</span>
                    </div>
                    {isStudent && <Badge variant="primary" size="sm">Active</Badge>}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('manager')}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <span className="font-semibold block">📋 Project Manager</span>
                      <span className="text-[10px] text-slate-400">Usman Ghani</span>
                    </div>
                    {isManager && <Badge variant="warning" size="sm">Active</Badge>}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <span className="font-semibold block">🛡️ Platform Admin</span>
                      <span className="text-[10px] text-slate-400">Muhammad Tariq</span>
                    </div>
                    {isAdmin && <Badge variant="danger" size="sm">Active</Badge>}
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Real-time Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleToggleNotif}
                    className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60 relative transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-3 shadow-2xl border border-slate-700 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Notifications</h4>
                          {unreadCount > 0 && (
                            <Badge variant="danger" size="sm">
                              {unreadCount} new
                            </Badge>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-saylani-400 hover:text-saylani-300 flex items-center gap-1 font-medium"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 my-2">
                        {notifLoading ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            Loading updates...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400">
                            <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                            <p className="text-xs">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                                notif.isRead
                                  ? 'hover:bg-slate-800/40 opacity-75'
                                  : 'bg-saylani-500/10 hover:bg-saylani-500/20 border-l-2 border-saylani-400'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-semibold text-white">
                                  {notif.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill & Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700/60 transition-all"
                  >
                    <img
                      src={
                        user?.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={user?.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-600"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-white truncate max-w-[100px]">
                        {user?.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-amber-400">
                          {user?.points || 0} pts
                        </span>
                        <span className="text-[9px] text-slate-400 capitalize">
                          • {user?.role}
                        </span>
                      </div>
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-700 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-bold text-white">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <div className="mt-1">
                          <Badge
                            variant={isAdmin ? 'danger' : isManager ? 'warning' : 'primary'}
                            size="sm"
                          >
                            {user?.role?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setTab('profile');
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-saylani-400" />
                        <span>My Profile & Badges</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setTab('dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                        <span>Role Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          setTab('home');
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 transition-colors border-t border-slate-800/80 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTab('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setTab('register')}
                  className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/25 transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-2 animate-in slide-in-from-top duration-200">
            <button
              onClick={() => {
                setTab('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-slate-200 rounded-xl hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => {
                setTab('projects');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-slate-200 rounded-xl hover:bg-slate-800 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> Projects
            </button>
            <button
              onClick={() => {
                setTab('leaderboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-slate-200 rounded-xl hover:bg-slate-800 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
            </button>
            {isAuthenticated && (
              <button
                onClick={() => {
                  setTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-200 rounded-xl hover:bg-slate-800 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  setTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-rose-300 rounded-xl hover:bg-rose-500/20 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Admin Console
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
