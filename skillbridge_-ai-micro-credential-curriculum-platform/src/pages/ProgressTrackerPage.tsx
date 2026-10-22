import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserRoadmaps,
  getLearningProgress,
  saveLearningProgress
} from '../lib/dataService';
import { LearningRoadmap, LearningProgress } from '../types';
import { Badge } from '../components/common/Badge';
import {
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Save,
  Sparkles,
  FileBadge,
  Code2,
  AlertCircle
} from 'lucide-react';

export const ProgressTrackerPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<LearningRoadmap | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const userRoadmaps = await getUserRoadmaps(currentUser.uid);
        setRoadmaps(userRoadmaps);

        if (userRoadmaps.length > 0) {
          const first = userRoadmaps[0];
          setActiveRoadmap(first);
          if (first.id) {
            const prog = await getLearningProgress(currentUser.uid, first.id);
            if (prog) {
              setProgress(prog);
              setNotes(prog.notes || '');
            } else {
              const fresh: LearningProgress = {
                userId: currentUser.uid,
                roadmapId: first.id,
                completedModuleIds: [],
                percentComplete: 0,
                notes: '',
                lastUpdated: new Date().toISOString()
              };
              setProgress(fresh);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleToggleModule = async (moduleId: string) => {
    if (!currentUser || !activeRoadmap || !activeRoadmap.id) return;

    const currentCompleted = progress?.completedModuleIds || [];
    const isCompleted = currentCompleted.includes(moduleId);
    const updated = isCompleted
      ? currentCompleted.filter(id => id !== moduleId)
      : [...currentCompleted, moduleId];

    const total = activeRoadmap.modules.length || 1;
    const percent = Math.round((updated.length / total) * 100);

    const updatedProg: LearningProgress = {
      userId: currentUser.uid,
      roadmapId: activeRoadmap.id,
      completedModuleIds: updated,
      percentComplete: percent,
      notes: notes,
      lastUpdated: new Date().toISOString()
    };

    try {
      await saveLearningProgress(updatedProg);
      setProgress(updatedProg);
      setFeedback('Progress automatically saved.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!currentUser || !activeRoadmap || !activeRoadmap.id || !progress) return;
    setSavingNotes(true);
    try {
      const updatedProg: LearningProgress = {
        ...progress,
        notes: notes,
        lastUpdated: new Date().toISOString()
      };
      await saveLearningProgress(updatedProg);
      setProgress(updatedProg);
      setFeedback('Study notes saved successfully.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (!activeRoadmap && !loading) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center max-w-xl mx-auto">
        <Award className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white">No Active Roadmap Found</h2>
        <p className="text-xs text-slate-400 mt-2">
          Please run a Skill-Gap Analysis and generate a personalized curriculum first.
        </p>
      </div>
    );
  }

  const percent = progress?.percentComplete || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Learning Progress & Competency Milestone Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track module completions, practical lab assignments, and certification readiness.
          </p>
        </div>

        {feedback && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 self-start sm:self-auto">
            {feedback}
          </span>
        )}
      </div>

      {activeRoadmap && (
        <div className="space-y-8">
          {/* Progress Overview Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Target: {activeRoadmap.targetRole}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {activeRoadmap.microCredentialTitle}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-3xl font-bold font-mono text-emerald-400">
                  {percent}%
                </span>
                <p className="text-[11px] uppercase font-semibold text-slate-400">
                  {progress?.completedModuleIds.length || 0} of {activeRoadmap.modules.length} Modules Done
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Module Checklist */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white">
              Curriculum Milestone Checklist
            </h3>

            <div className="space-y-3">
              {activeRoadmap.modules.map((mod) => {
                const isComplete = progress?.completedModuleIds.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isComplete
                        ? 'bg-slate-950/80 border-emerald-800/60'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={isComplete || false}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1 w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                            Module {mod.order}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {mod.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {mod.objective}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-xs text-slate-500 font-mono">
                        ~{mod.estimatedHours}h
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          isComplete
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isComplete ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Study Notes Section */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Personal Study Log & Assignment Notes
            </h3>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record your lab links, GitHub commit hashes, key takeaways, and question marks here..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                {savingNotes ? 'Saving Notes...' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Micro-Credential Certificate Preview */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-700/50 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <FileBadge className="w-16 h-16 text-indigo-500/20" />
            </div>

            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 border border-indigo-700/60 px-3 py-1 rounded-full bg-indigo-950">
                Official Micro-Credential Verification Preview
              </span>
              <h3 className="text-2xl font-serif text-white tracking-wide pt-2">
                Certificate of Competency
              </h3>
              <p className="text-xs text-slate-300 italic">
                Awarded to <strong className="text-white not-italic">{userProfile?.displayName || 'Student'}</strong> upon completion of the requirements for:
              </p>
              <p className="text-base font-bold text-indigo-200">
                {activeRoadmap.microCredentialTitle}
              </p>
              <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-slate-400 border-t border-slate-800/80">
                <span>Modules: {progress?.completedModuleIds.length || 0} / {activeRoadmap.modules.length} Completed</span>
                <span>•</span>
                <span>Status: {percent === 100 ? 'Certified' : 'In Progress'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
