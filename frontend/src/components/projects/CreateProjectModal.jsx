import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Sparkles } from 'lucide-react';

const COMMON_DOMAINS = [
  'Web Development',
  'Artificial Intelligence & GenAI',
  'Mobile App Innovation',
  'Data Science & Analytics',
  'Cloud & DevOps',
  'Cybersecurity',
  'Blockchain & Web3',
  'IoT & Robotics',
  'Game Development'
];

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'Web Development',
    team_size: 4,
    deadline: '',
    availability_requirement: '10-15 hrs/week',
  });

  const [skills, setSkills] = useState([
    { skill_name: 'Python', proficiency_level: 'Intermediate' }
  ]);
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const [currentProficiency, setCurrentProficiency] = useState('Intermediate');

  const [roles, setRoles] = useState([
    { role_name: 'Frontend Developer', open_spots: 1 }
  ]);
  const [currentRoleInput, setCurrentRoleInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = () => {
    if (!currentSkillInput.trim()) return;
    setSkills([...skills, { skill_name: currentSkillInput.trim(), proficiency_level: currentProficiency }]);
    setCurrentSkillInput('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddRole = () => {
    if (!currentRoleInput.trim()) return;
    setRoles([...roles, { role_name: currentRoleInput.trim(), open_spots: 1 }]);
    setCurrentRoleInput('');
  };

  const handleRemoveRole = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }

    setSubmitting(true);
    try {
      await onProjectCreated({
        ...formData,
        required_skills: skills,
        roles: roles
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        domain: 'Web Development',
        team_size: 4,
        deadline: '',
        availability_requirement: '10-15 hrs/week',
      });
      setSkills([{ skill_name: 'Python', proficiency_level: 'Intermediate' }]);
      setRoles([{ role_name: 'Frontend Developer', open_spots: 1 }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. AI-Powered Course Recommendation Portal"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Domain *
            </label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              {COMMON_DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Team Size (including you)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={formData.team_size}
              onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) || 4 })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Description & Objectives *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detail the goals, key features, architecture, and what makes this collaboration exciting..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Deadline / Timeline
            </label>
            <input
              type="text"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              placeholder="e.g. End of Semester / 6 Weeks"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Weekly Commitment Requirement
            </label>
            <select
              value={formData.availability_requirement}
              onChange={(e) => setFormData({ ...formData, availability_requirement: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="5-10 hrs/week">5-10 hrs/week (Flexible)</option>
              <option value="10-15 hrs/week">10-15 hrs/week (Standard)</option>
              <option value="15+ hrs/week">15+ hrs/week (Intensive)</option>
              <option value="Weekends only">Weekends only</option>
            </select>
          </div>
        </div>

        {/* Required Skills Builder */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Required Technical Skills
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              list="project-skill-suggestions"
              value={currentSkillInput}
              onChange={(e) => setCurrentSkillInput(e.target.value)}
              placeholder="e.g. Node.js, JavaScript, React.js, Python, MongoDB"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
            />
            <datalist id="project-skill-suggestions">
              <option value="Node.js" />
              <option value="JavaScript" />
              <option value="React.js" />
              <option value="TypeScript" />
              <option value="Python" />
              <option value="Express.js" />
              <option value="MongoDB" />
              <option value="SQL" />
              <option value="Docker" />
              <option value="Tailwind CSS" />
            </datalist>
            <select
              value={currentProficiency}
              onChange={(e) => setCurrentProficiency(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs">
                <span>{s.skill_name}</span>
                <span className="text-[10px] text-slate-400">({s.proficiency_level})</span>
                <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-slate-400 hover:text-rose-600">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Roles Builder */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Open Team Roles
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentRoleInput}
              onChange={(e) => setCurrentRoleInput(e.target.value)}
              placeholder="e.g. Frontend Lead, ML Engineer, UI Designer"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } }}
            />
            <button
              type="button"
              onClick={handleAddRole}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Add Role
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {roles.map((r, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-md text-xs font-medium">
                <span>{r.role_name}</span>
                <button type="button" onClick={() => handleRemoveRole(idx)} className="text-brand-400 hover:text-brand-700">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
            {submitting ? 'Creating Project...' : 'Publish Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
