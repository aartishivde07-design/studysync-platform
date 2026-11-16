import React from 'react';

export const ProficiencyBadge = ({ level }) => {
  const styles = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
    Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const style = styles[level] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {level || 'Intermediate'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    recruiting: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels = {
    recruiting: 'Recruiting',
    in_progress: 'In Progress',
    completed: 'Completed',
    pending: 'Pending Review',
    accepted: 'Accepted',
    rejected: 'Declined',
    cancelled: 'Cancelled',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

export const TagPill = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200/80 rounded-lg text-xs font-medium">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-brand-900 focus:outline-none p-0.5 rounded-full hover:bg-brand-100"
        >
          &times;
        </button>
      )}
    </span>
  );
};
