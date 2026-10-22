import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getJobPostings,
  getLearningResources,
  calculateAndGetSkillTrends
} from '../lib/dataService';
import { JobPosting, LearningResource, SkillTrendRecord } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  ShieldCheck,
  Database,
  Layers,
  TrendingUp,
  FileCheck2,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [trends, setTrends] = useState<SkillTrendRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [postings, recs] = await Promise.all([
          getJobPostings(),
          getLearningResources()
        ]);
        setJobs(postings);
        setResources(recs);
        const calculated = await calculateAndGetSkillTrends(postings);
        setTrends(calculated);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center max-w-lg mx-auto">
        <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          Your account does not hold administrative clearance. Superuser privileges are restricted to verified institution administrators.
        </p>
      </div>
    );
  }

  // Calculate unique skills in dataset
  const uniqueSkillsSet = new Set<string>();
  jobs.forEach(j => j.requiredSkills.forEach(s => uniqueSkillsSet.add(s)));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Institutional Administration Console
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Curriculum & Job Dataset Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit permitted job market corpora, track dataset freshness, manage canonical skill taxonomies, and curate accredited learning resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/datasets"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Database className="w-4 h-4" />
            Manage Datasets
          </Link>
          <Link
            to="/admin/resources"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Layers className="w-4 h-4" />
            Manage Resources
          </Link>
        </div>
      </div>

      {/* Aggregate Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Permitted Job Postings"
          value={jobs.length}
          subtitle="In active benchmarking index"
          icon={Database}
          badge="Active"
          badgeColor="emerald"
        />
        <StatCard
          title="Unique Skills Indexed"
          value={uniqueSkillsSet.size}
          subtitle="Across tech domains"
          icon={TrendingUp}
          badge="Normalized"
          badgeColor="indigo"
        />
        <StatCard
          title="Curated Learning Resources"
          value={resources.length}
          subtitle="NPTEL, Coursera & edX"
          icon={Layers}
          badge="Verified"
          badgeColor="purple"
        />
        <StatCard
          title="Dataset Compliance"
          value="100%"
          subtitle="Zero unverified scraping"
          icon={ShieldCheck}
          badge="Compliant"
          badgeColor="emerald"
        />
      </div>

      {/* Dataset Freshness & Governance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Job Postings Ingested */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Dataset Records Freshness
            </h3>
            <Link to="/admin/datasets" className="text-xs text-indigo-400 hover:text-indigo-300">
              View All Postings
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => (
              <div
                key={job.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[220px]">
                    {job.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {job.company} • Source: {job.dataSource}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    {job.updatedAt || 'Recent'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {job.requiredSkills.length} skills indexed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Resources Overview */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Verified Learning Providers
            </h3>
            <Link to="/admin/resources" className="text-xs text-purple-400 hover:text-purple-300">
              View All Resources
            </Link>
          </div>

          <div className="space-y-3">
            {resources.slice(0, 5).map(res => (
              <div
                key={res.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[220px]">
                    {res.title}
                  </p>
                  <p className="text-[11px] text-indigo-400 mt-0.5 font-semibold">
                    {res.provider} • {res.difficulty}
                  </p>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Verified ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
