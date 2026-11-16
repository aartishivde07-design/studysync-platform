import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, ProficiencyBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { InitialsAvatar } from '../components/common/InitialsAvatar';

export const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [recRes, sentRes] = await Promise.all([
        api.get('/requests/received'),
        api.get('/requests/sent')
      ]);
      setReceivedRequests(recRes.data.requests || []);
      setSentRequests(sentRes.data.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      setActionError('');
      await api.put(`/requests/${requestId}/accept`);
      setActionMsg('Applicant accepted and added to the team roster!');
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionError('');
      await api.put(`/requests/${requestId}/reject`);
      setActionMsg('Application declined.');
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to decline request');
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this join request?')) return;
    try {
      setActionError('');
      await api.put(`/requests/${requestId}/cancel`);
      setActionMsg('Join request cancelled.');
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  const pendingReceivedCount = receivedRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Join Requests & Inquiries</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage applications to your projects and track the status of teams you've applied to.
        </p>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg('')} className="font-bold text-emerald-700">&times;</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="font-bold text-rose-700">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Received Applications</span>
          {pendingReceivedCount > 0 && (
            <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">
              {pendingReceivedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>My Sent Applications</span>
          <span className="text-xs text-slate-400">({sentRequests.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving project applications..." />
      ) : activeTab === 'received' ? (
        /* Received Applications Tab */
        receivedRequests.length > 0 ? (
          <div className="space-y-4">
            {receivedRequests.map((req) => {
              const applicant = req.applicant || {};
              const skills = applicant.skills || [];
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={applicant.full_name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/students/${applicant.id}`}
                            className="font-semibold text-slate-900 hover:text-brand-600 text-sm"
                          >
                            {applicant.full_name}
                          </Link>
                          <span className="text-xs text-slate-400">• {applicant.academic_year}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Applied for role: <strong className="text-brand-700">{req.role_applied}</strong> in project{' '}
                          <Link to={`/projects/${req.project_id}`} className="font-semibold text-slate-800 hover:underline">
                            {req.project?.title}
                          </Link>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  {/* Applicant's message */}
                  {req.message && (
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                      "{req.message}"
                    </div>
                  )}

                  {/* Applicant's skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Applicant Skills:</span>
                      {skills.slice(0, 5).map((s) => (
                        <span key={s.id || s.skill_name} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700">
                          {s.skill_name}
                          <ProficiencyBadge level={s.proficiency} />
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons for pending requests */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200/60"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors"
                      >
                        Accept & Add to Team
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="notifications"
            title="No join requests received"
            description="When students discover your projects and apply, their applications will show up here for your review."
          />
        )
      ) : (
        /* Sent Applications Tab */
        sentRequests.length > 0 ? (
          <div className="space-y-4">
            {sentRequests.map((req) => {
              const project = req.project || {};
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Application for:</span>
                      <Link
                        to={`/projects/${req.project_id}`}
                        className="text-base font-semibold text-slate-900 hover:text-brand-600 block mt-0.5"
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        Role Applied: <strong className="text-brand-700">{req.role_applied}</strong> • Leader:{' '}
                        {project.creator_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <StatusBadge status={req.status} />
                      {isPending && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {req.message && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Your note:</strong> {req.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="search"
            title="No pending requests sent"
            description="You haven't applied to any projects yet. Discover semester projects and apply to open roles!"
            actionLabel="Discover Projects"
            onAction={() => window.location.href = '/projects'}
          />
        )
      )}
    </div>
  );
};
