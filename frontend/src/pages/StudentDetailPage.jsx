import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, Mail, Clock, BookOpen, Layers, Award, Sparkles, Building2, Calendar } from 'lucide-react';
import { ProficiencyBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { InitialsAvatar } from '../components/common/InitialsAvatar';

export const StudentDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/profiles/${id}`);
        setProfile(res.data.profile);
      } catch (err) {
        console.error("Failed to fetch student details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Retrieving student profile details..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-slate-800">Student not found</h2>
        <Link to="/matches" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          Return to Matches
        </Link>
      </div>
    );
  }

  const p = profile.profile || {};
  const skills = profile.skills || [];
  const interests = profile.interests || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/matches"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Matches
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
          <InitialsAvatar name={profile.full_name} size="2xl" rounded="rounded-2xl" />

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
            <p className="text-sm font-medium text-slate-600">
              {profile.department} • <span className="text-brand-600">{profile.academic_year}</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {p.college_name || 'University Campus'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {p.availability || '10-15 hrs/week'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {p.bio && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Introduction & Background</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{p.bio}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-600" />
            Technical Skills & Proficiency
          </h3>
          {skills.length > 0 ? (
            <div className="space-y-2.5">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{s.skill_name}</span>
                    <span className="text-[10px] text-slate-400 block">{s.category || 'General'}</span>
                  </div>
                  <ProficiencyBadge level={s.proficiency} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No skills registered yet.</p>
          )}
        </div>

        {/* Academic Interests & Learning Goals */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              Academic & Project Interests
            </h3>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((int) => (
                  <span key={int.id} className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-xs font-medium">
                    {int.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No interests registered yet.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Learning Goals
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {p.learning_goals || 'Working towards building impactful collaborative projects and expanding technical skill breadth.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
