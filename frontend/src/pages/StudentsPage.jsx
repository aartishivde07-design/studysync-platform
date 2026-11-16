import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Users, ChevronRight, Clock, Award } from 'lucide-react';
import { ProficiencyBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const StudentsPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (department.trim()) params.department = department.trim();
      if (skillFilter.trim()) params.skill = skillFilter.trim();

      const res = await api.get('/profiles', { params });
      setProfiles(res.data.profiles || []);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [department]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProfiles();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Connect with registered classmates across departments and discover peer skillsets.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. Flask, React)..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science & AI</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <LoadingSpinner text="Loading student directory..." />
      ) : profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((p) => {
            const prof = p.profile || {};
            const skills = p.skills || [];

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-brand-300"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {prof.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={p.full_name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-base border border-brand-200/60">
                        {p.full_name ? p.full_name[0] : 'S'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link to={`/students/${p.id}`} className="font-semibold text-slate-900 hover:text-brand-600 block truncate">
                        {p.full_name}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">{p.department}</p>
                      <span className="text-[10px] text-brand-700 font-semibold">{p.academic_year}</span>
                    </div>
                  </div>

                  {prof.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {prof.bio}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((s) => (
                          <span key={s.id || s.skill_name} className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                            {s.skill_name}
                            <span className="text-[9px] text-slate-400">({s.proficiency?.[0]})</span>
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prof.availability || '10-15 hrs/wk'}</span>
                  </div>

                  <Link
                    to={`/students/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="teams"
          title="No registered students found"
          description="Try clearing the search filters or invite classmates to create their StudySync profiles."
        />
      )}
    </div>
  );
};
