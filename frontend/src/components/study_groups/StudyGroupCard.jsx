import React from 'react';
import { BookOpen, Users, Calendar, CheckCircle2, UserPlus, LogOut } from 'lucide-react';

export const StudyGroupCard = ({ group, onJoin, onLeave }) => {
  const memberCount = group.current_members_count || group.members?.length || 1;
  const maxMembers = group.max_members || 6;
  const isMember = group.is_member;
  const isFull = group.is_full || memberCount >= maxMembers;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-brand-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100/80">
            {group.subject}
          </span>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {memberCount}/{maxMembers} Members
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 text-lg mb-2 line-clamp-1">
          {group.name}
        </h3>

        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {group.description}
        </p>

        <div className="space-y-2 text-xs text-slate-500 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="font-medium text-slate-700">{group.meeting_schedule}</span>
          </div>
          {group.preferred_learning_method && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>{group.preferred_learning_method}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Created by <span className="font-medium text-slate-800">{group.creator?.full_name || 'Classmate'}</span>
        </div>

        <div>
          {isMember ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Joined
              </span>
              {onLeave && (
                <button
                  onClick={() => onLeave(group.id)}
                  title="Leave Study Group"
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : isFull ? (
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              Group Full
            </span>
          ) : (
            <button
              onClick={() => onJoin(group.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
