import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveResumeAnalysis, saveResumeRecord, getLatestResumeAnalysis } from '../lib/dataService';
import { ResumeAnalysis } from '../types';
import { Badge } from '../components/common/Badge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Briefcase,
  GraduationCap,
  Plus,
  X,
  Save,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResumeAnalysisPage: React.FC = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [editableSkills, setEditableSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  // Load existing analysis if available
  useEffect(() => {
    async function loadExisting() {
      if (!currentUser) return;
      try {
        const existing = await getLatestResumeAnalysis(currentUser.uid);
        if (existing) {
          setAnalysis(existing);
          setEditableSkills(existing.extractedSkills || []);
        }
      } catch (err) {
        console.error('Failed to load existing resume analysis:', err);
      }
    }
    loadExisting();
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      const isDocx = selected.name.endsWith('.docx');
      const isPdf = selected.name.endsWith('.pdf');

      if (!validTypes.includes(selected.type) && !isDocx && !isPdf) {
        setError('Unsupported file type. Please upload a PDF or DOCX file.');
        return;
      }

      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit. Please upload a smaller document.');
        return;
      }

      setFile(selected);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !currentUser) {
      setError('Please select a resume file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('resumeFile', file);
    formData.append('userId', currentUser.uid);

    try {
      const res = await fetch('/api/resume/upload-and-extract', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error processing resume.');
      }

      const parsedAnalysis: ResumeAnalysis = {
        userId: currentUser.uid,
        resumeFileName: data.fileName,
        extractedSkills: data.analysis.extractedSkills || [],
        categorizedSkills: data.analysis.categorizedSkills || {},
        experienceYears: data.analysis.experienceYears || 0,
        educationLevel: data.analysis.educationLevel || "Bachelor's Degree",
        projectsIdentified: data.analysis.projectsIdentified || [],
        aiGenerated: data.aiGenerated,
        updatedAt: new Date().toISOString()
      };

      // Save record in Firestore
      await saveResumeRecord({
        userId: currentUser.uid,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        uploadedAt: new Date().toISOString(),
        summary: `Extracted ${parsedAnalysis.extractedSkills.length} skills with ${parsedAnalysis.experienceYears} estimated years of experience.`
      });

      // Save analysis in Firestore
      await saveResumeAnalysis(parsedAnalysis);

      // Update student profile confirmed skills automatically
      const currentSkills = userProfile?.confirmedSkills || [];
      const mergedSkills = Array.from(new Set([...currentSkills, ...parsedAnalysis.extractedSkills]));
      await updateUserProfile({ confirmedSkills: mergedSkills });

      setAnalysis(parsedAnalysis);
      setEditableSkills(parsedAnalysis.extractedSkills);
      setSuccess(`Resume analyzed successfully! Extracted ${parsedAnalysis.extractedSkills.length} technical skills.`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during resume extraction.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditableSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (!clean) return;
    if (editableSkills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setError('Skill already exists in the extracted list.');
      return;
    }
    setEditableSkills(prev => [...prev, clean]);
    setNewSkillInput('');
    setError(null);
  };

  const handleSaveConfirmedSkills = async () => {
    if (!currentUser) return;
    setIsSavingSkills(true);
    try {
      await updateUserProfile({ confirmedSkills: editableSkills });
      if (analysis) {
        await saveResumeAnalysis({
          ...analysis,
          extractedSkills: editableSkills,
          updatedAt: new Date().toISOString()
        });
      }
      setSuccess('Confirmed skills successfully synchronized with your profile!');
    } catch (err: any) {
      setError(err.message || 'Failed to update confirmed skills.');
    } finally {
      setIsSavingSkills(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          Resume Upload & AI Skill Extraction
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your PDF or DOCX resume to extract technical proficiencies, frameworks, experience levels, and projects. You have full control to verify or edit the extracted skills.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="border-2 border-dashed border-slate-750 hover:border-indigo-500/60 rounded-2xl p-8 text-center bg-slate-950/40 transition-colors">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-slate-200">
            {file ? file.name : 'Choose a resume file or drag & drop here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accepts PDF, DOCX, or TXT formats (up to 10 MB).
          </p>

          <div className="mt-5 flex justify-center">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors">
              <span>Select Document</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {file && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-white">{file.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              onClick={handleUploadAndAnalyze}
              disabled={uploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Parsing & Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Server-Side Extraction</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Extracted Profile Competencies
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Source: {analysis.resumeFileName || 'Uploaded Resume'} •{' '}
                  {analysis.aiGenerated ? 'Gemini 3.8 Flash Analysis' : 'Deterministic Heuristic Extraction'}
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                Verified Extraction
              </span>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Detected Education
                  </p>
                  <p className="text-xs font-medium text-slate-200 mt-0.5">
                    {analysis.educationLevel}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Experience Level
                  </p>
                  <p className="text-xs font-medium text-slate-200 mt-0.5">
                    {analysis.experienceYears > 0
                      ? `Approx. ${analysis.experienceYears} Years Demonstrated Experience`
                      : 'Early Career / Undergraduate Profile'}
                  </p>
                </div>
              </div>
            </div>

            {/* Editable Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Confirmed Skills ({editableSkills.length})
                </label>
                <span className="text-[11px] text-slate-400">
                  Click 'x' to remove or add missing skills below
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap gap-2 min-h-[70px]">
                {editableSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-700/50"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 hover:text-rose-400 rounded transition-colors"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add manual skill */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  placeholder="Add custom skill (e.g. Next.js, FastAPI)..."
                  className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveConfirmedSkills}
                  disabled={isSavingSkills}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingSkills ? 'Saving...' : 'Save & Sync Skills to Profile'}
                </button>
              </div>
            </div>

            {/* Categorized Skills Breakdown */}
            {analysis.categorizedSkills && Object.keys(analysis.categorizedSkills).length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(analysis.categorizedSkills).map(([cat, list]) => {
                    if (!list || list.length === 0) return null;
                    return (
                      <div key={cat} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                        <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                          {cat}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map(s => (
                            <Badge key={s} variant="neutral" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Identified Projects */}
            {analysis.projectsIdentified && analysis.projectsIdentified.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                  Projects Identified from Resume
                </h3>
                <div className="space-y-3">
                  {analysis.projectsIdentified.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <p className="text-xs font-bold text-white">{proj.title}</p>
                      <p className="text-xs text-slate-300 mt-1">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies?.map(tech => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Step Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-blue-950/30 border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Skills confirmed! What's next?</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Compare your extracted profile against market postings to identify missing competencies.
              </p>
            </div>
            <Link
              to="/gap-analysis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
            >
              Run Skill-Gap Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
