import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MatchCard } from '../components/matching/MatchCard';
import { AlgorithmExplainModal } from '../components/matching/AlgorithmExplainModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Sparkles, HelpCircle, Sliders, Search, RefreshCw } from 'lucide-react';

export const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explainOpen, setExplainOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches');
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    const candidate = m.candidate || {};
    const nameMatch = candidate.full_name?.toLowerCase().includes(search.toLowerCase());
    const skillMatch = candidate.skills?.some(s => s.skill_name?.toLowerCase().includes(search.toLowerCase()));
    const scoreMatch = (m.compatibility_score || 0) >= minScore;
    return (nameMatch || skillMatch) && scoreMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
              AI Recommendation Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Teammate Matching</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real compatibility recommendations computed from complementary skills, shared interests, and availability.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setExplainOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-brand-600" />
            How Matching Works
          </button>
          <button
            onClick={fetchMatches}
            title="Refresh recommendations"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name or skill..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Min Compatibility: <strong>{minScore}%</strong>
          </span>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="w-36 accent-brand-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <LoadingSpinner text="Computing real-time compatibility scores for registered students..." />
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.map((m) => (
            <MatchCard key={m.candidate.id} match={m} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="matches"
          title="No matching students yet"
          description="Invite your classmates to join StudySync. As more students register and list their technical skills, you will receive tailored recommendations."
          actionLabel="Explore Student Directory"
          onAction={() => window.location.href = '/students'}
        />
      )}

      {/* How it works modal */}
      <AlgorithmExplainModal
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
      />
    </div>
  );
};
