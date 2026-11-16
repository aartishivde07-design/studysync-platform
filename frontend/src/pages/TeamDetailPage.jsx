import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, ShieldCheck, Users, Award, Mail, ExternalLink } from 'lucide-react';
import { StatusBadge, ProficiencyBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { InitialsAvatar } from '../components/common/InitialsAvatar';

export const TeamDetailPage = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/teams/${id}`);
        setTeam(res.data.team);
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading team roster and management workspace..." />;
  }

  if (!team) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-slate-800">Team not found</h2>
        <Link to="/teams" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          Return to Teams Hub
        </Link>
      </div>
    );
  }

  const project = team.project || {};
  const members = team.members || [];
  const leader = members.find(m => m.role?.toLowerCase().includes('leader')) || members[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/teams"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Teams
      </Link>

      {/* Team Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                {project.domain || 'Team'}
              </span>
              <StatusBadge status={project.status || 'in_progress'} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{team.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Working on initiative:{' '}
              <Link to={`/projects/${project.id}`} className="font-semibold text-brand-600 hover:underline">
                {project.title}
              </Link>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Team Capacity</span>
            <span className="text-lg font-bold text-slate-900">
              {members.length} / {project.team_size || 4} Members
            </span>
          </div>
        </div>

        {team.is_authorized_manager && (
          <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-2xl text-xs text-brand-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>You are the authorized Team Leader for this project team workspace.</span>
          </div>
        )}
      </div>

      {/* Roster & Member Skills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600" />
          Assigned Roles & Member Skillsets
        </h3>

        <div className="space-y-4">
          {members.map((m) => {
            const u = m.user || {};
            const skills = u.skills || [];

            return (
              <div key={m.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={u.full_name} size="md" />
                    <div>
                      <Link to={`/students/${u.id}`} className="font-semibold text-slate-900 hover:text-brand-600 text-sm">
                        {u.full_name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {u.department} • {u.academic_year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-brand-100 text-brand-800 rounded-lg">
                      {m.role || 'Member'}
                    </span>
                    <a
                      href={`mailto:${u.email}`}
                      title={`Email ${u.full_name}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Technical Skills for this member */}
                {skills.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Skills:</span>
                    {skills.map((s) => (
                      <span key={s.id || s.skill_name} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700">
                        {s.skill_name}
                        <ProficiencyBadge level={s.proficiency} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
