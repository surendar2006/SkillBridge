import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  saveLearningRoadmap,
  getUserRoadmaps,
  saveLearningProgress,
  getLearningProgress
} from '../lib/dataService';
import { LearningRoadmap, LearningProgress } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Code2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  FolderGit2
} from 'lucide-react';

export const CurriculumRoadmapPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<LearningRoadmap | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);

  // Incoming parameters from Gap Analysis
  const targetRoleState = (location.state as any)?.targetRole || userProfile?.targetJobRole || 'Full Stack Cloud Engineer';
  const missingSkillsState = (location.state as any)?.missingSkills || ['Docker', 'Kubernetes', 'PostgreSQL', 'AWS'];

  useEffect(() => {
    async function loadRoadmaps() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const existing = await getUserRoadmaps(currentUser.uid);
        setRoadmaps(existing);

        if (existing.length > 0) {
          setActiveRoadmap(existing[0]);
          if (existing[0].id) {
            const prog = await getLearningProgress(currentUser.uid, existing[0].id);
            setProgress(prog);
          }
        }
      } catch (err) {
        console.error('Failed to load learning roadmaps:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRoadmaps();
  }, [currentUser]);

  const handleGenerateCurriculum = async () => {
    if (!currentUser) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/gemini/generate-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSkills: userProfile?.confirmedSkills || ['React', 'JavaScript', 'Python'],
          targetRole: targetRoleState,
          missingSkills: missingSkillsState,
          educationLevel: userProfile?.education || "Bachelor of Technology"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate curriculum.');

      const curriculum = data.curriculum;
      const newRoadmap: LearningRoadmap = {
        userId: currentUser.uid,
        targetRole: targetRoleState,
        microCredentialTitle: curriculum.microCredentialTitle,
        summary: curriculum.summary,
        estimatedWeeks: curriculum.estimatedWeeks || 8,
        totalModules: curriculum.modules.length,
        modules: curriculum.modules,
        capstoneProject: curriculum.capstoneProject,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docId = await saveLearningRoadmap(newRoadmap);
      newRoadmap.id = docId;

      // Initialize initial progress tracking document
      const initialProgress: LearningProgress = {
        userId: currentUser.uid,
        roadmapId: docId,
        completedModuleIds: [],
        percentComplete: 0,
        notes: 'Initial roadmap generated and enrolled.',
        lastUpdated: new Date().toISOString()
      };
      await saveLearningProgress(initialProgress);

      setRoadmaps(prev => [newRoadmap, ...prev]);
      setActiveRoadmap(newRoadmap);
      setProgress(initialProgress);
      setSelectedModuleIdx(0);
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleModuleComplete = async (moduleId: string) => {
    if (!currentUser || !activeRoadmap || !activeRoadmap.id) return;

    const currentCompleted = progress?.completedModuleIds || [];
    const isCompleted = currentCompleted.includes(moduleId);
    const updatedCompleted = isCompleted
      ? currentCompleted.filter(id => id !== moduleId)
      : [...currentCompleted, moduleId];

    const total = activeRoadmap.modules.length || 1;
    const percent = Math.round((updatedCompleted.length / total) * 100);

    const updatedProgress: LearningProgress = {
      userId: currentUser.uid,
      roadmapId: activeRoadmap.id,
      completedModuleIds: updatedCompleted,
      percentComplete: percent,
      notes: progress?.notes || '',
      lastUpdated: new Date().toISOString()
    };

    try {
      await saveLearningProgress(updatedProgress);
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const selectedModule = activeRoadmap?.modules[selectedModuleIdx] || null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Personalized Micro-Credential Curriculum
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Industry-aligned learning roadmaps dynamically architected to bridge your verified skill gaps for {targetRoleState}.
          </p>
        </div>

        <button
          onClick={handleGenerateCurriculum}
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Architecting Curriculum...' : activeRoadmap ? 'Regenerate Curriculum' : 'Generate Curriculum'}
        </button>
      </div>

      {!activeRoadmap && !generating && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No Micro-Credential Curriculum Generated Yet</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            Click below to synthesize your confirmed resume skills and bridge prioritized gaps with our server-side curriculum engine.
          </p>
          <button
            onClick={handleGenerateCurriculum}
            disabled={generating}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            Synthesize Micro-Credential Curriculum Now
          </button>
        </div>
      )}

      {activeRoadmap && (
        <div className="space-y-8">
          {/* Top Roadmap Details Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/50 p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
                  <Award className="w-3.5 h-3.5" />
                  Accredited Competency Specification
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {activeRoadmap.microCredentialTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {activeRoadmap.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    Estimated Duration: {activeRoadmap.estimatedWeeks} Weeks
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-4 h-4 text-purple-400" />
                    {activeRoadmap.modules.length} Sequential Modules
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {progress?.completedModuleIds.length || 0} / {activeRoadmap.modules.length} Completed ({progress?.percentComplete || 0}%)
                  </span>
                </div>
              </div>

              {/* Progress Dial */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0 min-w-[140px]">
                <span className="text-3xl font-bold font-mono text-emerald-400">
                  {progress?.percentComplete || 0}%
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-1">
                  Overall Completion
                </span>
              </div>
            </div>
          </div>

          {/* Module Step-by-Step Navigation & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Module Sidebar Checklist */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Curriculum Modules ({activeRoadmap.modules.length})
              </h3>

              <div className="space-y-2">
                {activeRoadmap.modules.map((mod, idx) => {
                  const isDone = progress?.completedModuleIds.includes(mod.id) || false;
                  const isSelected = selectedModuleIdx === idx;

                  return (
                    <div
                      key={mod.id}
                      onClick={() => setSelectedModuleIdx(idx)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-600/70 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleModuleComplete(mod.id);
                            }}
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-slate-700 hover:border-indigo-400 text-transparent'
                            }`}
                            title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase">
                              Module {mod.order}
                            </span>
                            <p className="text-xs font-semibold mt-0.5 line-clamp-1">{mod.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ~{mod.estimatedHours} Hours
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 ${isSelected ? 'text-indigo-400' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Module Deep Dive (2 columns) */}
            {selectedModule && (
              <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
                      Module {selectedModule.order} of {activeRoadmap.modules.length}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedModule.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleModuleComplete(selectedModule.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      progress?.completedModuleIds.includes(selectedModule.id)
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {progress?.completedModuleIds.includes(selectedModule.id)
                      ? 'Completed ✓'
                      : 'Mark Module Complete'}
                  </button>
                </div>

                {/* Objective */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Module Objective
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    {selectedModule.objective}
                  </p>
                </div>

                {/* Prerequisites & Key Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Prerequisites
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModule.prerequisites.map(prereq => (
                        <Badge key={prereq} variant="neutral" size="sm">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Key Competency Topics
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModule.keyTopics.map(topic => (
                        <Badge key={topic} variant="primary" size="sm">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Resources */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Recommended Study Resources
                  </h4>
                  <div className="space-y-2">
                    {selectedModule.recommendedResources?.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-600/50 flex items-center justify-between gap-4 group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {res.title}
                          </p>
                          <span className="text-[10px] text-indigo-400 font-medium">
                            {res.provider} • {res.type}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Practical Deliverable Task */}
                {selectedModule.practicalTask && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/20 border border-indigo-800/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Practical Portfolio Lab: {selectedModule.practicalTask.title}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedModule.practicalTask.description}
                    </p>
                    <div className="mt-3 pt-3 border-t border-indigo-800/40 flex items-center gap-2 text-[11px] text-indigo-400 font-medium">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      Deliverable: {selectedModule.practicalTask.deliverable}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Capstone Project Card */}
          {activeRoadmap.capstoneProject && (
            <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-800/50 p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-purple-400" />
                Comprehensive Capstone Project Specification
              </div>
              <h3 className="text-lg font-bold text-white">
                {activeRoadmap.capstoneProject.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {activeRoadmap.capstoneProject.objective}
              </p>
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-purple-900/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Architecture & Key Deliverables
                </p>
                <p className="text-xs text-slate-300 mb-3">
                  {activeRoadmap.capstoneProject.architectureDescription}
                </p>
                <div className="space-y-1.5">
                  {activeRoadmap.capstoneProject.keyDeliverables?.map((del, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
