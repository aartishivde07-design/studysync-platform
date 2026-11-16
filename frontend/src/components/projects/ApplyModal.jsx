import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Send } from 'lucide-react';

export const ApplyModal = ({ isOpen, onClose, project, onApplySubmit }) => {
  const [roleApplied, setRoleApplied] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roles = project?.roles || [];
  const defaultRole = roles.length > 0 ? roles[0].role_name : 'Contributor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onApplySubmit({
        project_id: project.id,
        role_applied: roleApplied || defaultRole,
        message: message.trim()
      });
      onClose();
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply to ${project?.title || 'Project'}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Choose Preferred Role *
          </label>
          <select
            value={roleApplied || defaultRole}
            onChange={(e) => setRoleApplied(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            {roles.map((r) => (
              <option key={r.id || r.role_name} value={r.role_name}>
                {r.role_name} ({r.open_spots} open)
              </option>
            ))}
            {roles.length === 0 && <option value="Contributor">Contributor</option>}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Application Message & Why You're a Good Fit *
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, highlight relevant skills, past work, and what you hope to contribute to this team..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Sending Request...' : 'Send Join Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
