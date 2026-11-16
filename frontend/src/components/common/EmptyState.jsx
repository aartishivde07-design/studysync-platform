import React from 'react';
import { Sparkles, FolderPlus, Users, Bell, Search } from 'lucide-react';

const icons = {
  matches: Sparkles,
  projects: FolderPlus,
  teams: Users,
  notifications: Bell,
  search: Search,
};

export const EmptyState = ({
  icon = 'search',
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) => {
  const IconComponent = icons[icon] || Search;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-slate-100/80 shadow-sm my-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
        <IconComponent className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
