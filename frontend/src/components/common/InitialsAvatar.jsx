import React from 'react';

const COLOR_THEMES = [
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-brand-100 text-brand-700 border-brand-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
];

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim().split(/\s+/).filter(Boolean);
  if (clean.length === 0) return 'U';
  if (clean.length === 1) {
    return clean[0].slice(0, Math.min(2, clean[0].length)).toUpperCase();
  }
  return (clean[0][0] + clean[clean.length - 1][0]).toUpperCase();
};

export const InitialsAvatar = ({ name = 'Student', size = 'md', className = '', rounded = 'rounded-full' }) => {
  const initials = getInitials(name);

  // Deterministic color hash based on string
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const colorClass = COLOR_THEMES[Math.abs(hash) % COLOR_THEMES.length];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold',
    '2xl': 'w-20 h-20 text-2xl font-bold',
  }[size] || 'w-10 h-10 text-sm font-semibold';

  return (
    <div
      className={`inline-flex items-center justify-center border select-none shrink-0 ${sizeClasses} ${colorClass} ${rounded} ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
};
