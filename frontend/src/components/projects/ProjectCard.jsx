import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge, ProficiencyBadge } from '../common/Badge';

export const ProjectCard = ({ project, onApply }) => {
  const membersCount = project.members_count || 1;
  const teamSize = project.team_size || 4;
  const progressPercent = Math.min(Math.round((membersCount / teamSize) * 100), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-brand-300">
      <div>
        {/* Header: Domain & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-100/80">
            {project.domain}
          </span>
          <StatusBadge status={project.status} />
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block group-hover:text-brand-600 transition-colors">
          <h3 className="font-semibold text-slate-900 text-lg line-clamp-1 mb-2">
            {project.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Required skills */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {project.required_skills.slice(0, 4).map((s) => (
                <span key={s.id || s.skill_name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-700">
                  {s.skill_name}
                  <span className="text-[10px] text-slate-400">({s.proficiency_level?.[0]})</span>
                </span>
              ))}
              {project.required_skills.length > 4 && (
                <span className="text-xs text-slate-400 self-center">
                  +{project.required_skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        {/* Team Progress & Availability */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{membersCount}/{teamSize} spots filled</span>
          </div>
          {project.availability_requirement && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.availability_requirement}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progressPercent >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
              {project.creator?.full_name ? project.creator.full_name[0] : 'S'}
            </div>
            <div className="text-xs">
              <span className="text-slate-500">By </span>
              <span className="font-medium text-slate-800">{project.creator?.full_name || 'Student'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project.is_member ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Member
              </span>
            ) : project.user_join_status === 'pending' ? (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                Request Pending
              </span>
            ) : (
              <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                View Project
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
