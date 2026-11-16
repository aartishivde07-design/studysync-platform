import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StudyGroupCard } from '../components/study_groups/StudyGroupCard';
import { CreateStudyGroupModal } from '../components/study_groups/CreateStudyGroupModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Plus, BookOpen, CheckCircle2 } from 'lucide-react';

export const StudyGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'joined'
  const [alertMsg, setAlertMsg] = useState('');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (subjectFilter.trim()) params.subject = subjectFilter.trim();

      const res = await api.get('/study-groups', { params });
      setGroups(res.data.study_groups || []);
    } catch (err) {
      console.error("Failed to load study groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [subjectFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleGroupCreated = async (groupData) => {
    await api.post('/study-groups', groupData);
    setAlertMsg('Study group created successfully!');
    fetchGroups();
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/study-groups/${groupId}/join`);
      setAlertMsg('Successfully joined the study group!');
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this study group?')) return;
    try {
      await api.post(`/study-groups/${groupId}/leave`);
      setAlertMsg('Left study group.');
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to leave group');
    }
  };

  const displayedGroups = groups.filter((g) => {
    if (activeTab === 'joined') return g.is_member;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Study Groups & Circles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Form weekly study sessions, prepare for semester exams, and solve coursework challenges together.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Study Group
        </button>
      </div>

      {alertMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{alertMsg}</span>
          </div>
          <button onClick={() => setAlertMsg('')} className="font-bold text-emerald-700">&times;</button>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by group name, subject, or topic..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'joined'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            My Joined Groups
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Loading study circles..." />
      ) : displayedGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedGroups.map((group) => (
            <StudyGroupCard
              key={group.id}
              group={group}
              onJoin={handleJoinGroup}
              onLeave={handleLeaveGroup}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="teams"
          title={activeTab === 'joined' ? "You haven't joined any groups yet" : "No study groups found"}
          description="Create a subject study group for your semester courses to start collaborating with classmates."
          actionLabel="Create Study Group"
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {/* Modal */}
      <CreateStudyGroupModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};
