import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLearningResources, toggleSavedItem, getUserSavedItems } from '../lib/dataService';
import { LearningResource, SavedItem } from '../types';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Award,
  Clock,
  Star
} from 'lucide-react';

export const CourseRecommendationsPage: React.FC = () => {
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState((location.state as any)?.searchSkill || '');
  const [providerFilter, setProviderFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [res, saved] = await Promise.all([
          getLearningResources(),
          currentUser ? getUserSavedItems(currentUser.uid) : Promise.resolve([])
        ]);
        setResources(res);
        setSavedItems(saved);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleToggleBookmark = async (resource: LearningResource) => {
    if (!currentUser) return;
    try {
      const isSaved = await toggleSavedItem(currentUser.uid, resource.id, 'course', resource);
      if (isSaved) {
        setSavedItems(prev => [...prev, { userId: currentUser.uid, itemId: resource.id, itemType: 'course', itemData: resource, savedAt: new Date().toISOString() }]);
      } else {
        setSavedItems(prev => prev.filter(s => s.itemId !== resource.id));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const isBookmarked = (id: string) => savedItems.some(s => s.itemId === id && s.itemType === 'course');

  const providers = ['All', 'NPTEL', 'Coursera', 'edX', 'Official Documentation', 'Stanford Online'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', 'micro_credential', 'certification', 'course'];

  // Calculate relevance: rank higher if covers student's target or confirmed skills
  const studentSkills = userProfile?.confirmedSkills || [];
  const normSkills = new Set(studentSkills.map(s => s.toLowerCase()));

  const filteredResources = resources.filter(res => {
    const matchesProvider = providerFilter === 'All' || res.provider === providerFilter;
    const matchesDifficulty = difficultyFilter === 'All' || res.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'All' || res.type === typeFilter;
    const matchesQuery =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skillsCovered.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesProvider && matchesDifficulty && matchesType && matchesQuery;
  }).sort((a, b) => {
    // Sort by number of matched student skills
    const aMatch = a.skillsCovered.filter(s => normSkills.has(s.toLowerCase())).length;
    const bMatch = b.skillsCovered.filter(s => normSkills.has(s.toLowerCase())).length;
    return bMatch - aMatch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          Verified Course & Micro-Credential Recommendations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Hand-curated, accredited learning resources from NPTEL, Coursera, edX, and official vendor portals to bridge specific engineering skill gaps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search skill (e.g. Cloud, PyTorch)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Provider:</span>
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {providers.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Level:</span>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {difficulties.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Format:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {types.map(t => (
                <option key={t} value={t}>
                  {t === 'micro_credential' ? 'Micro-Credential' : t === 'certification' ? 'Certification' : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => {
          const bookmarked = isBookmarked(res.id);

          return (
            <div
              key={res.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between shadow-xl transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/40">
                    {res.provider}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(res)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      bookmarked
                        ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                        : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800'
                    }`}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark course'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                  {res.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {res.estimatedDuration}
                  </span>
                  <span>•</span>
                  <span>{res.difficulty}</span>
                  {res.rating && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {res.rating}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Skills Covered:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {res.skillsCovered.map(skill => (
                      <Badge key={skill} variant="neutral" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Curriculum
                </span>

                <a
                  href={res.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-white">No courses match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search filter or selecting another provider.</p>
        </div>
      )}
    </div>
  );
};
