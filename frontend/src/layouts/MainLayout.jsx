import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { InitialsAvatar } from '../components/common/InitialsAvatar';
import {
  LayoutDashboard,
  FolderGit2,
  Sparkles,
  Layers,
  BookOpen,
  Inbox,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Discover Projects', icon: FolderGit2 },
    { to: '/matches', label: 'Smart Match', icon: Sparkles, badge: 'AI' },
    { to: '/teams', label: 'My Teams', icon: Layers },
    { to: '/study-groups', label: 'Study Groups', icon: BookOpen },
    { to: '/requests', label: 'Join Requests', icon: Inbox },
    { to: '/profile', label: 'My Profile & Skills', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbfd] flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-brand-500/20">
            S
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">StudySync</span>
            <span className="text-[10px] font-semibold block text-brand-600 uppercase tracking-widest -mt-1">
              Team making
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded-md">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card in Sidebar Bottom */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
              <InitialsAvatar name={user?.full_name} size="sm" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.department || 'Student'}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-medium text-slate-400">Welcome back,</span>
              <h2 className="text-sm font-semibold text-slate-800">{user?.full_name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action button */}
            <Link
              to="/matches"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Find Matches</span>
            </Link>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-800">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-medium text-brand-600 hover:text-brand-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        You're all caught up! No notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                            !n.is_read ? 'bg-brand-50/30' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-brand-600' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            {n.link && (
                              <Link
                                to={n.link}
                                onClick={() => {
                                  markAsRead(n.id);
                                  setNotificationsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 mt-1"
                              >
                                View details <ChevronRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                          {!n.is_read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              title="Mark read"
                              className="text-slate-400 hover:text-brand-600 p-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile user profile button */}
            <Link to="/profile" className="md:hidden">
              <InitialsAvatar name={user?.full_name} size="sm" />
            </Link>
          </div>
        </header>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
