import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Layers, Users, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams');
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Active Teams</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Projects and collaboration groups where you are either the leader or an active member.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your teams..." />
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((t) => {
            const project = t.project || {};
            const members = t.members || [];
            const leader = members.find(m => m.role?.toLowerCase().includes('leader')) || members[0];

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-brand-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                      {project.domain || 'Team Workspace'}
                    </span>
                    <StatusBadge status={project.status || 'in_progress'} />
                  </div>

                  <Link to={`/teams/${t.id}`}>
                    <h3 className="font-semibold text-slate-900 text-lg hover:text-brand-600 transition-colors mb-2">
                      {t.name}
                    </h3>
                  </Link>

                  <div className="text-xs text-slate-500 space-y-1 mb-4">
                    <p>
                      <strong className="text-slate-700">Project:</strong> {project.title}
                    </p>
                    <p>
                      <strong className="text-slate-700">Team Leader:</strong> {leader?.user?.full_name || 'Team Lead'}
                    </p>
                  </div>

                  {/* Member Avatars list */}
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Team Roster ({members.length} members)
                    </p>
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px]">
                              {m.user?.full_name ? m.user.full_name[0] : 'U'}
                            </div>
                            <span className="font-medium text-slate-800">{m.user?.full_name}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {m.role || 'Member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Target Team Size: {project.team_size || 4}
                  </span>
                  <Link
                    to={`/teams/${t.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Manage Roster <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="teams"
          title="No joined teams yet"
          description="You are not part of any project teams yet. Discover open projects or create your own to assemble teammates."
          actionLabel="Explore Projects"
          onAction={() => window.location.href = '/projects'}
        />
      )}
    </div>
  );
};
