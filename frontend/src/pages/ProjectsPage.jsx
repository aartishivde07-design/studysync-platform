import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Plus, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

const DOMAIN_OPTIONS = [
  'All Domains',
  'Web Development',
  'Artificial Intelligence & GenAI',
  'Mobile App Innovation',
  'Data Science & Analytics',
  'Cloud & DevOps',
  'Cybersecurity',
  'Blockchain & Web3'
];

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [skillFilter, setSkillFilter] = useState('');
  const [filterMine, setFilterMine] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDomain !== 'All Domains') params.domain = selectedDomain;
      if (skillFilter.trim()) params.skill = skillFilter.trim();
      if (filterMine) params.mine = 'true';

      const res = await api.get('/projects', { params });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedDomain, filterMine]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleProjectCreated = async (projectData) => {
    await api.post('/projects', projectData);
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Idea Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover student-led initiatives, find open roles, and form high-performing semester teams.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title, keywords, or description..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Skill Filter */}
          <div className="w-full md:w-56">
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. React)..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Apply Filters
          </button>
        </form>

        {/* Domain Chips and My Projects Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {DOMAIN_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedDomain === d
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFilterMine(!filterMine)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
              filterMine
                ? 'bg-brand-50 text-brand-700 border-brand-200 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterMine ? '✓ Showing My Projects' : 'Show Only My Projects'}
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner text="Searching through project listings..." />
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="projects"
          title="No projects match your criteria"
          description="Try broadening your search keywords, clearing domain filters, or publish your own project."
          actionLabel="Create Project"
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {/* Modal for creating a project */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};
