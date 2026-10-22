import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Sun,
  Moon,
  Target,
  Bell,
  Shield,
  LogOut,
  Save,
  CheckCircle2,
  Database,
  Cpu
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateUserProfile, logout, currentUser, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [targetRole, setTargetRole] = useState(userProfile?.targetJobRole || 'Full Stack Cloud Engineer');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [curriculumUpdates, setCurriculumUpdates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const availableRoles = [
    'Full Stack Cloud Engineer',
    'AI/ML Applications Developer',
    'DevOps & Site Reliability Engineer',
    'Frontend React & UI/UX Specialist',
    'Data Platform Engineer',
    'Cybersecurity Analyst & SecOps',
    'Backend Go & Distributed Systems Engineer',
    'Mobile Applications Developer'
  ];

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateUserProfile({ targetJobRole: targetRole });
      setFeedback('Settings successfully updated!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error('Settings update error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Platform Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your interface, notification cadence, target career direction, and account configuration.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Appearance & Theme */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            Interface Appearance
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Theme Mode
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Current theme is set to <strong className="text-white capitalize">{theme} Mode</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Career Target */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-4 h-4 text-purple-400" />
            Career Focus Target
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Default Target Career Role
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2">
              Determines default benchmarks for your dashboard and resume skill-gap comparisons.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-indigo-400" />
            Notification Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-200">Job Market Demand Alerts</p>
                <p className="text-[11px] text-slate-400">Receive alerts when new top-demanded skills appear in your target field.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-200">Micro-Credential Milestone Reminders</p>
                <p className="text-[11px] text-slate-400">Weekly pacing notifications to stay on schedule with module completion.</p>
              </div>
              <input
                type="checkbox"
                checked={curriculumUpdates}
                onChange={e => setCurriculumUpdates(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Platform Telemetry & Environment */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            System Architecture Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[10px]">Database Engine</span>
              <span className="text-slate-200 font-mono font-medium mt-1 block">Cloud Firestore (Enterprise)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[10px]">AI Integration</span>
              <span className="text-slate-200 font-mono font-medium mt-1 block">Gemini 3.8 Flash (Server-Side)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
