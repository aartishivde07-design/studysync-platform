import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FolderGit2,
  Users,
  Inbox,
  Sparkles,
  ArrowRight,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { MatchCard } from '../components/matching/MatchCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleProjectCreated = async (projectData) => {
    await api.post('/projects', projectData);
    fetchDashboardStats();
  };

  if (loading) {
    return <LoadingSpinner text="Compiling your personal collaboration dashboard..." />;
  }

  const completion = stats?.profile_completion || 0;
  const missingItems = stats?.missing_profile_items || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-brand-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              StudySync Student Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Hello, {stats?.welcome_name || user?.full_name}! 👋
            </h1>
            <p className="text-brand-100 text-sm leading-relaxed">
              Find compatible teammates for semester projects, build smart teams, and join collaborative study groups tailored to your skills.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-brand-50 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500/30 hover:bg-brand-500/40 text-white border border-white/20 text-xs font-semibold rounded-xl backdrop-blur-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-brand-200" />
              Find Teammates
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Indicator */}
      {completion < 100 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 font-bold text-sm">
                {completion}%
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Profile Strength & Match Accuracy</h4>
                <p className="text-xs text-slate-500">
                  A complete profile improves your compatibility matching score and helps team leaders find you.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
            >
              Complete Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>

          {missingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="font-medium text-slate-600">Suggested steps:</span>
              {missingItems.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[11px]">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/projects" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Live</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.available_projects_count ?? 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Available Projects</p>
        </Link>

        <Link to="/requests" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
            {(stats?.pending_requests_count ?? 0) > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">Action</span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.pending_requests_count ?? 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Pending Requests</p>
        </Link>

        <Link to="/teams" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.joined_teams_count ?? 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Joined Teams</p>
        </Link>

        <Link to="/study-groups" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">Active</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Study Groups</p>
        </Link>
      </div>

      {/* Recommended Teammates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              Recommended Teammates
            </h2>
            <p className="text-xs text-slate-500">
              Matched algorithmically based on your technical skills, interests, and schedule.
            </p>
          </div>
          <Link
            to="/matches"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all matches <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recommended_teammates && stats.recommended_teammates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recommended_teammates.map((m) => (
              <MatchCard key={m.candidate.id} match={m} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="matches"
            title="No matching students yet"
            description="Invite your classmates to register and add their technical skills to discover high-compatibility teammates."
            actionLabel="Find Matches"
            onAction={() => window.location.href = '/matches'}
          />
        )}
      </section>

      {/* Recommended Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-brand-600" />
              Discover Projects For You
            </h2>
            <p className="text-xs text-slate-500">
              Projects currently looking for collaborators with your skillset.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Explore all projects <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recommended_projects && stats.recommended_projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recommended_projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="projects"
            title="No projects created yet"
            description="Be the first to launch an initiative! Create a project and start assembling your dream student team."
            actionLabel="Create a Project"
            onAction={() => setCreateModalOpen(true)}
          />
        )}
      </section>

      {/* Recent Activity / Notifications Section */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Recent Activity & Updates</h3>
          <Link to="/requests" className="text-xs font-medium text-brand-600 hover:underline">
            Manage Requests
          </Link>
        </div>

        {stats?.recent_activities && stats.recent_activities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recent_activities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{act.title}</p>
                  <p className="text-slate-500 mt-0.5">{act.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            You're all caught up! No recent activity notifications.
          </div>
        )}
      </section>

      {/* Modal for creating a project */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};
