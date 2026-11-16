import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { ProficiencyBadge, TagPill } from '../components/common/Badge';
import { InitialsAvatar } from '../components/common/InitialsAvatar';

const POPULAR_SKILL_SUGGESTIONS = [
  'Node.js',
  'JavaScript',
  'React.js',
  'TypeScript',
  'Python',
  'Express.js',
  'MongoDB',
  'SQL',
  'HTML/CSS',
  'Tailwind CSS',
  'Docker',
  'Git / GitHub',
  'Java',
  'C++',
  'Machine Learning',
  'UI/UX Design (Figma)'
];

const POPULAR_INTEREST_SUGGESTIONS = [
  'Full-Stack Web Development',
  'Artificial Intelligence & GenAI',
  'Data Science & Analytics',
  'Mobile App Development',
  'Cloud Computing & DevOps',
  'Cybersecurity & Ethical Hacking',
  'Blockchain & Web3',
  'Open Source Collaboration'
];

export const ProfilePage = () => {
  const { user, updateProfile, addSkill, removeSkill, addInterest, removeInterest } = useAuth();

  const profile = user?.profile || {};
  const skills = user?.skills || [];
  const interests = user?.interests || [];

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    college_name: profile.college_name || '',
    department: user?.department || '',
    academic_year: user?.academic_year || '1st Year',
    college_email: profile.college_email || '',
    bio: profile.bio || '',
    learning_goals: profile.learning_goals || '',
    preferred_domains: Array.isArray(profile.preferred_domains)
      ? profile.preferred_domains.join(', ')
      : profile.preferred_domains || '',
    availability: profile.availability || '10-15 hrs/week',
  });

  // Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');
  const [addingSkill, setAddingSkill] = useState(false);

  // Interest Add State
  const [newInterestName, setNewInterestName] = useState('');
  const [addingInterest, setAddingInterest] = useState(false);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSavingProfile(true);
    try {
      await updateProfile(formData);
      setSuccessMsg('Your profile has been updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    try {
      await addSkill({
        name: newSkillName.trim(),
        proficiency: newSkillProficiency
      });
      setNewSkillName('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleQuickAddSkill = (skill) => {
    setNewSkillName(skill);
  };

  const handleRemoveSkill = async (id) => {
    try {
      await removeSkill(id);
    } catch (err) {
      alert('Failed to remove skill');
    }
  };

  const handleAddInterest = async (e) => {
    if (e) e.preventDefault();
    if (!newInterestName.trim()) return;
    setAddingInterest(true);
    try {
      await addInterest({
        name: newInterestName.trim()
      });
      setNewInterestName('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add interest');
    } finally {
      setAddingInterest(false);
    }
  };

  const handleRemoveInterest = async (id) => {
    try {
      await removeInterest(id);
    } catch (err) {
      alert('Failed to remove interest');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Initials Profile Badge */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <InitialsAvatar name={user?.full_name} size="2xl" rounded="rounded-2xl" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.full_name}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/60 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-brand-600" />
                Initials Avatar
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Login Email: <span className="text-slate-700 font-semibold">{user?.email}</span>
            </p>
            <p className="text-xs text-slate-500">
              {user?.department} • <span className="text-brand-600 font-medium">{user?.academic_year}</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl p-3 max-w-xs text-center sm:text-left">
          <p className="font-semibold text-slate-600 mb-0.5">Privacy First</p>
          <span>Photos are replaced with personal name initials for privacy and clean collaboration across StudySync.</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="font-bold text-emerald-700">&times;</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="font-bold text-rose-700">&times;</button>
        </div>
      )}

      {/* General Information Form */}
      <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          General Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Email (Login Email)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College Email ID <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.college_email}
              onChange={(e) => setFormData({ ...formData, college_email: e.target.value })}
              placeholder="e.g. student@college.edu"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College / Institute Name
            </label>
            <input
              type="text"
              value={formData.college_name}
              onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
              placeholder="e.g. Institute of Engineering"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department / Major *
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Science"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Year *
            </label>
            <select
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Weekly Availability Commitment
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="5-10 hrs/week">5-10 hrs/week (Flexible)</option>
              <option value="10-15 hrs/week">10-15 hrs/week (Standard)</option>
              <option value="15+ hrs/week">15+ hrs/week (Intensive)</option>
              <option value="Weekends only">Weekends only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Short Introduction / Bio
          </label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell fellow students about your background, interests, and what projects you want to build..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Learning Goals
            </label>
            <input
              type="text"
              value={formData.learning_goals}
              onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
              placeholder="e.g. Master Node.js, build distributed systems"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Project Domains (comma-separated)
            </label>
            <input
              type="text"
              value={formData.preferred_domains}
              onChange={(e) => setFormData({ ...formData, preferred_domains: e.target.value })}
              placeholder="e.g. Web Development, AI/ML, Mobile"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Technical Skills & Proficiency Levels Manager */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" />
            <span className="text-base font-semibold text-slate-900">Technical Skills & Proficiency Levels</span>
          </div>
          <span className="text-xs font-normal text-slate-400">({skills.length} skills listed)</span>
        </div>

        {/* Popular skill quick suggestions */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quick Add Popular Options (e.g. Node.js, JavaScript, React.js):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleQuickAddSkill(s)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  newSkillName.toLowerCase() === s.toLowerCase()
                    ? 'bg-brand-600 text-white border-brand-600 font-semibold shadow-xs'
                    : 'bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border-slate-200/80'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Skill Form with Datalist options */}
        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <div className="flex-1 relative">
            <input
              type="text"
              required
              list="popular-skills-list"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Select or type skill (e.g. Node.js, JavaScript, Python)..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <datalist id="popular-skills-list">
              {POPULAR_SKILL_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="Beginner">Beginner (Fundamentals)</option>
              <option value="Intermediate">Intermediate (Project-Ready)</option>
              <option value="Advanced">Advanced (Production Experience)</option>
            </select>

            <button
              type="submit"
              disabled={addingSkill}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>
        </form>

        {/* Added Skills list */}
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3">
            {skills.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs hover:border-brand-200 transition-colors"
              >
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{s.skill_name}</span>
                  <div className="mt-1">
                    <ProficiencyBadge level={s.proficiency} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s.id)}
                  title="Remove skill"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">No skills added yet. Select or type Node.js, JavaScript, React.js, etc., above.</p>
        )}
      </div>

      {/* Areas of Interest Manager */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-base font-semibold text-slate-900">Academic & Collaboration Interests</span>
          </div>
          <span className="text-xs font-normal text-slate-400">({interests.length} interests)</span>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Domains & Interests:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_INTEREST_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setNewInterestName(item)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  newInterestName.toLowerCase() === item.toLowerCase()
                    ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                    : 'bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border-slate-200/80'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddInterest} className="flex gap-2.5 pt-2">
          <input
            type="text"
            required
            list="popular-interests-list"
            value={newInterestName}
            onChange={(e) => setNewInterestName(e.target.value)}
            placeholder="Add an interest (e.g. Full-Stack Web Development, AI & GenAI)..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <datalist id="popular-interests-list">
            {POPULAR_INTEREST_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <button
            type="submit"
            disabled={addingInterest}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Interest
          </button>
        </form>

        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {interests.map((int) => (
              <TagPill
                key={int.id}
                label={int.name}
                onRemove={() => handleRemoveInterest(int.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">No interests selected yet.</p>
        )}
      </div>
    </div>
  );
};
