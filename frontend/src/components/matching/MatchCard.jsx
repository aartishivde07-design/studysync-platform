import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronUp, UserPlus, CheckCircle2, Clock, BookOpen, Layers } from 'lucide-react';
import { ProficiencyBadge } from '../common/Badge';
import { InitialsAvatar } from '../common/InitialsAvatar';

export const MatchCard = ({ match, onInvite }) => {
  const [showDetails, setShowDetails] = useState(false);
  const candidate = match.candidate || {};
  const profile = candidate.profile || {};
  const score = match.compatibility_score || 0;
  const breakdown = match.breakdown || {};
  const reasons = match.reasons || [];

  // Color gradient based on compatibility score
  const getScoreBadgeColor = (val) => {
    if (val >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 70) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (val >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-brand-300">
      <div>
        {/* Top Header: Candidate Avatar & Compatibility Gauge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={candidate.full_name} size="lg" />
            <div>
              <Link to={`/students/${candidate.id}`} className="font-semibold text-slate-900 hover:text-brand-600 transition-colors">
                <h4 className="text-base font-semibold text-slate-900">{candidate.full_name}</h4>
              </Link>
              <p className="text-xs text-slate-500 font-medium">
                {candidate.department} • {candidate.academic_year}
              </p>
            </div>
          </div>

          {/* Compatibility Percentage Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getScoreBadgeColor(score)}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{score}% Match</span>
          </div>
        </div>

        {/* Explainability Badges (Why recommended) */}
        {reasons.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {reasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-brand-900 bg-brand-50/70 border border-brand-100/80 px-2.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Technical Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 5).map((s) => (
                <span key={s.id || s.skill_name} className="inline-flex items-center gap-1">
                  <span className="text-xs text-slate-700 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    {s.skill_name}
                  </span>
                  <ProficiencyBadge level={s.proficiency} />
                </span>
              ))}
              {candidate.skills.length > 5 && (
                <span className="text-xs text-slate-400 self-center">
                  +{candidate.skills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Availability & Interests summary */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.availability || '10-15 hrs/week'}</span>
          </div>
          {profile.learning_goals && (
            <div className="flex items-center gap-1 line-clamp-1 max-w-[180px]">
              <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile.learning_goals}</span>
            </div>
          )}
        </div>

        {/* Expandable Breakdown Drawer */}
        {showDetails && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              Algorithm Score Breakdown:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-400">Skill Complement:</span>{' '}
                <strong className="text-slate-700">{breakdown.skill_coverage ?? breakdown.required_skill_coverage ?? 0}%</strong>
              </div>
              <div>
                <span className="text-slate-400">Interests Alignment:</span>{' '}
                <strong className="text-slate-700">{breakdown.interest_compatibility ?? breakdown.domain_interest_match ?? 0}%</strong>
              </div>
              <div>
                <span className="text-slate-400">Schedule Compatibility:</span>{' '}
                <strong className="text-slate-700">{breakdown.availability_compatibility ?? 0}%</strong>
              </div>
              <div>
                <span className="text-slate-400">Goal Synergy:</span>{' '}
                <strong className="text-slate-700">{breakdown.goal_compatibility ?? breakdown.goal_alignment ?? 0}%</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Proficiency Suitability:</span>{' '}
                <strong className="text-slate-700">{breakdown.proficiency_suitability ?? 0}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          {showDetails ? (
            <>
              Hide breakdown <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Score breakdown <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/students/${candidate.id}`}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Profile
          </Link>
          {onInvite && (
            <button
              onClick={() => onInvite(candidate)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
