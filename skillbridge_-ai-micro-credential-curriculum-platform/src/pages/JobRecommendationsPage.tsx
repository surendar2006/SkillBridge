import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobPostings, toggleSavedItem, getUserSavedItems } from '../lib/dataService';
import { JobPosting, SavedItem } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Briefcase,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const JobRecommendationsPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [minMatchFilter, setMinMatchFilter] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [postings, saved] = await Promise.all([
          getJobPostings(),
          currentUser ? getUserSavedItems(currentUser.uid) : Promise.resolve([])
        ]);
        setJobs(postings);
        setSavedItems(saved);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleToggleBookmark = async (job: JobPosting) => {
    if (!currentUser) return;
    try {
      const isSaved = await toggleSavedItem(currentUser.uid, job.id, 'job', job);
      if (isSaved) {
        setSavedItems(prev => [...prev, { userId: currentUser.uid, itemId: job.id, itemType: 'job', itemData: job, savedAt: new Date().toISOString() }]);
      } else {
        setSavedItems(prev => prev.filter(s => s.itemId !== job.id));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const isBookmarked = (id: string) => savedItems.some(s => s.itemId === id && s.itemType === 'job');

  const studentSkills = userProfile?.confirmedSkills || ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Python'];
  const normStudent = new Set(studentSkills.map(s => s.toLowerCase()));

  // Compute skill matches and rank
  const scoredJobs = jobs.map(job => {
    const matched = job.requiredSkills.filter(req => normStudent.has(req.toLowerCase()));
    const missing = job.requiredSkills.filter(req => !normStudent.has(req.toLowerCase()));
    const score = Math.round((matched.length / (job.requiredSkills.length || 1)) * 100);

    return {
      ...job,
      matched,
      missing,
      score
    };
  });

  const filteredJobs = scoredJobs.filter(job => {
    const matchesLevel = levelFilter === 'All' || job.experienceLevel === levelFilter;
    const matchesScore = job.score >= minMatchFilter;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesLevel && matchesScore && matchesSearch;
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          Job Market Alignment & Recommendations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Positions ranked by transparent skill match percentage against your confirmed competencies. Review missing skills before applying.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or skill..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Experience:</span>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Min Match:</span>
            <select
              value={minMatchFilter}
              onChange={e => setMinMatchFilter(Number(e.target.value))}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Any Match %</option>
              <option value={40}>40%+ Match</option>
              <option value={60}>60%+ Match</option>
              <option value={80}>80%+ Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {filteredJobs.map(job => {
          const bookmarked = isBookmarked(job.id);

          return (
            <div
              key={job.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 shadow-xl transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{job.title}</h2>
                    {job.isDemonstration && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Demonstration Record
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      {job.experienceLevel} Level
                    </span>
                    {job.postedDate && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Posted {job.postedDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-2xl font-bold font-mono ${
                        job.score >= 70
                          ? 'text-emerald-400'
                          : job.score >= 45
                          ? 'text-indigo-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {job.score}%
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Skill Match
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(job)}
                    className={`p-2 rounded-xl border transition-colors ${
                      bookmarked
                        ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                        : 'text-slate-500 hover:text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                    title={bookmarked ? 'Remove saved job' : 'Save job'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {job.description}
              </p>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    You Have ({job.matched.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matched.map(s => (
                      <Badge key={s} variant="success" size="sm">
                        {s}
                      </Badge>
                    ))}
                    {job.matched.length === 0 && (
                      <span className="text-xs text-slate-500 italic">None of the core requirements matched.</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    You Need to Learn ({job.missing.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.missing.map(s => (
                      <Badge key={s} variant="danger" size="sm">
                        {s}
                      </Badge>
                    ))}
                    {job.missing.length === 0 && (
                      <span className="text-xs text-emerald-400 font-medium">100% requirements met! Ready to apply.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Link & Verification */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Dataset Source: <strong className="text-slate-400 font-medium">{job.dataSource}</strong>
                </span>

                {job.sourceUrl && (
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <span>View Listing Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <Briefcase className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-white">No jobs match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try lowering the minimum match percentage or clearing filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
