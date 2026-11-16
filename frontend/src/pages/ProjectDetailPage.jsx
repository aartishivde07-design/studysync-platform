import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit,
  Send,
  UserCheck,
  ChevronLeft,
  ShieldCheck,
  Award
} from 'lucide-react';
import { StatusBadge, ProficiencyBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ApplyModal } from '../components/projects/ApplyModal';
import { MatchCard } from '../components/matching/MatchCard';
import { InitialsAvatar } from '../components/common/InitialsAvatar';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'recommendations'
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);

      // If user is creator, also fetch AI candidates for this project
      if (res.data.project.creator_id === user?.id) {
        try {
          const matchRes = await api.get(`/projects/${id}/matches`);
          setCandidates(matchRes.data.matches || []);
        } catch (e) {
          console.error("Failed to load candidate matches:", e);
        }
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id, user]);

  const handleApply = async (applyData) => {
    try {
      setActionError('');
      await api.post('/requests', applyData);
      setActionSuccess('Your join request has been submitted to the team leader!');
      fetchProjectDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to submit application');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This will also remove team memberships.')) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." />;
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-slate-800">Project not found</h2>
        <Link to="/projects" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          Return to Project Hub
        </Link>
      </div>
    );
  }

  const isCreator = project.creator_id === user?.id;
  const isMember = project.is_member;
  const isFull = project.is_full;
  const teamMembers = project.team?.members || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to all projects
      </Link>

      {/* Success / Error Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Project Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                {project.domain}
              </span>
              <StatusBadge status={project.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCreator ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteProject}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200/60"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ) : isMember ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                You are a Team Member
              </span>
            ) : project.user_join_status === 'pending' ? (
              <span className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold">
                Request Pending Review
              </span>
            ) : isFull ? (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
                Team Full
              </span>
            ) : (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                Apply to Join Team
              </button>
            )}
          </div>
        </div>

        {/* Project Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Project Creator</span>
            <Link to={`/students/${project.creator_id}`} className="font-semibold text-slate-800 hover:text-brand-600">
              {project.creator?.full_name}
            </Link>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Team Size</span>
            <span className="font-semibold text-slate-800">
              {project.members_count || 1} / {project.team_size} members
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Availability</span>
            <span className="font-semibold text-slate-800">{project.availability_requirement || 'Flexible'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Deadline</span>
            <span className="font-semibold text-slate-800">{project.deadline || 'Ongoing'}</span>
          </div>
        </div>

        {/* Creator Tabs: Details vs AI Recommendations */}
        {isCreator && (
          <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                activeTab === 'details'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Project Specifications & Roster
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Matching Candidates ({candidates.length})
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Description & Required Skills */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-3">About the Project</h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {project.description}
              </div>
            </div>

            {/* Required Technical Skills */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Required Technical Capabilities</h3>
              {project.required_skills && project.required_skills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.required_skills.map((s) => (
                    <div key={s.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-slate-800">{s.skill_name}</span>
                        <span className="block text-[11px] text-slate-400">Target Proficiency</span>
                      </div>
                      <ProficiencyBadge level={s.proficiency_level} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No specific required skills specified.</p>
              )}
            </div>

            {/* Roles Needed */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Open Project Roles</h3>
              {project.roles && project.roles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.roles.map((r) => (
                    <div key={r.id} className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-brand-900">{r.role_name}</span>
                        <span className="block text-[11px] text-brand-700/80">{r.open_spots} open position(s)</span>
                      </div>
                      {!isMember && !isCreator && (
                        <button
                          onClick={() => setApplyModalOpen(true)}
                          className="px-3 py-1 bg-white hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">General contributor roles available.</p>
              )}
            </div>
          </div>

          {/* Right Column: Team Roster & Creator Profile */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">Current Team Roster</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {teamMembers.length} / {project.team_size}
                </span>
              </div>

              <div className="space-y-3">
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                    <InitialsAvatar name={m.user?.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/students/${m.user_id}`} className="text-xs font-semibold text-slate-900 hover:text-brand-600 block truncate">
                        {m.user?.full_name}
                      </Link>
                      <span className="text-[11px] text-brand-700 font-medium bg-brand-50 px-1.5 py-0.5 rounded">
                        {m.role || 'Member'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {isCreator && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/requests"
                    className="block text-center text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 py-2 rounded-xl transition-colors"
                  >
                    View Received Applications
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AI Candidate Recommendations Tab */
        <div className="space-y-4">
          <div className="bg-brand-50/70 border border-brand-100 rounded-2xl p-4 text-xs text-brand-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-900 mb-0.5">AI-Powered Candidate Matching</p>
              <p className="text-brand-800">
                These registered students have high compatibility with this project's required technical stack, domain, and commitment hours. Reach out to invite them!
              </p>
            </div>
          </div>

          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand) => (
                <MatchCard key={cand.candidate.id} match={cand} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No matching registered candidates available yet.
            </div>
          )}
        </div>
      )}

      {/* Modal for applying */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        project={project}
        onApplySubmit={handleApply}
      />
    </div>
  );
};
