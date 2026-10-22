import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Target,
  Sparkles,
  Save,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile, currentUser } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [education, setEducation] = useState(userProfile?.education || '');
  const [targetJobRole, setTargetJobRole] = useState(userProfile?.targetJobRole || 'Full Stack Cloud Engineer');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [skills, setSkills] = useState<string[]>(userProfile?.confirmedSkills || ['React', 'JavaScript', 'Git', 'Python']);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const availableTargetRoles = [
    'Full Stack Cloud Engineer',
    'AI/ML Applications Developer',
    'DevOps & Site Reliability Engineer',
    'Frontend React & UI/UX Specialist',
    'Data Platform Engineer',
    'Cybersecurity Analyst & SecOps',
    'Backend Go & Distributed Systems Engineer',
    'Mobile Applications Developer'
  ];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (!clean) return;
    if (skills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setFeedback({ type: 'error', message: 'Skill already exists in your profile.' });
      return;
    }
    setSkills(prev => [...prev, clean]);
    setNewSkill('');
    setFeedback(null);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setLoading(true);
      await updateUserProfile({
        displayName,
        education,
        targetJobRole,
        bio,
        confirmedSkills: skills
      });
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error('Profile update error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Student Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Keep your education, career target, and verified technical skills up to date for precise AI curriculum recommendations.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Core Account Details Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Academic & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-slate-400 font-mono">
                <Mail className="w-4 h-4 text-slate-500" />
                {currentUser?.email}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Education / Degree Institution
            </label>
            <input
              type="text"
              value={education}
              onChange={e => setEducation(e.target.value)}
              placeholder="e.g. B.Tech in Computer Science, Bannari Amman Institute of Technology"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Professional Bio & Academic Interests
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Brief summary of your academic background, projects, and target specializations..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Target Career & Skill Mapping Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Target Career Role
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Primary Target Role for Skill Gap Benchmarking
            </label>
            <select
              value={targetJobRole}
              onChange={e => setTargetJobRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {availableTargetRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2">
              Your personalized curriculum and skill-gap recommendations are generated directly against requirements for this target.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Confirmed Technical Skills ({skills.length})
            </label>
            <p className="text-xs text-slate-400 mb-3">
              These skills will be matched against job postings. You can add skills manually or extract them automatically from your resume.
            </p>

            {/* Current skill tags */}
            <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 min-h-[60px]">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-700/50"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="p-0.5 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-500 italic">No skills listed yet. Add some below!</span>
              )}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="e.g. Docker, TypeScript, PyTorch"
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
