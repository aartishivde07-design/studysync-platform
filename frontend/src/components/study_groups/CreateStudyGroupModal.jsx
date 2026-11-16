import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export const CreateStudyGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    max_members: 6,
    meeting_schedule: 'Tuesdays & Thursdays at 6:00 PM',
    preferred_learning_method: 'Problem Solving & Concept Discussion',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.subject.trim() || !formData.description.trim()) {
      setError('Name, subject, and description are required');
      return;
    }

    setSubmitting(true);
    try {
      await onGroupCreated(formData);
      onClose();
      setFormData({
        name: '',
        subject: '',
        description: '',
        max_members: 6,
        meeting_schedule: 'Tuesdays & Thursdays at 6:00 PM',
        preferred_learning_method: 'Problem Solving & Concept Discussion',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create study group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Study Group" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Operating Systems & Algorithms Study Circle"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. CS202 / Database Systems"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Max Members
            </label>
            <input
              type="number"
              min="2"
              max="15"
              value={formData.max_members}
              onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 6 })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Description & Focus Topics *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Share what subjects, exam topics, assignments, or projects this group will tackle together..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Meeting Schedule / Location
          </label>
          <input
            type="text"
            value={formData.meeting_schedule}
            onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
            placeholder="e.g. Saturdays 10 AM (Discord or Campus Library)"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Preferred Learning Method
          </label>
          <input
            type="text"
            value={formData.preferred_learning_method}
            onChange={(e) => setFormData({ ...formData, preferred_learning_method: e.target.value })}
            placeholder="e.g. Peer Teaching, Past Papers, Whiteboarding"
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
            className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Study Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
