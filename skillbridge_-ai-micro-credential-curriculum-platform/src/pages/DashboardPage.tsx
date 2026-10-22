import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getJobPostings,
  getLearningResources,
  calculateAndGetSkillTrends,
  getLatestResumeAnalysis,
  getUserSkillGapReports,
  getUserRoadmaps,
  getLearningProgress
} from '../lib/dataService';
import {
  JobPosting,
  LearningResource,
  SkillTrendRecord,
  ResumeAnalysis,
  SkillGapReport,
  LearningRoadmap,
  LearningProgress
} from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  FileText,
  Target,
  Sparkles,
  BookOpen,
  Briefcase,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { currentUser, userProfile, isDemoUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [gapReports, setGapReports] = useState<SkillGapReport[]>([]);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [activeProgress, setActiveProgress] = useState<LearningProgress | null>(null);
  const [trends, setTrends] = useState<SkillTrendRecord[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<LearningResource[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [jobs, resources, latestAnalysis, reports, userRoadmaps] = await Promise.all([
          getJobPostings(),
          getLearningResources(),
          getLatestResumeAnalysis(currentUser.uid),
          getUserSkillGapReports(currentUser.uid),
          getUserRoadmaps(currentUser.uid)
        ]);

        setAnalysis(latestAnalysis);
        setGapReports(reports);
        setRoadmaps(userRoadmaps);

        // Calculate skill trends
        const calculatedTrends = await calculateAndGetSkillTrends(jobs);
        setTrends(calculatedTrends.slice(0, 6));

        // Featured resources
        setFeaturedCourses(resources.slice(0, 3));

        // Matched jobs based on student confirmed skills
        const studentSkills = userProfile?.confirmedSkills || latestAnalysis?.extractedSkills || [];
        const normStudent = new Set(studentSkills.map(s => s.toLowerCase()));
        
        const rankedJobs = jobs.map(job => {
          const matchCount = job.requiredSkills.filter(req =>
            normStudent.has(req.toLowerCase())
          ).length;
          return {
            ...job,
            matchPercent: Math.round((matchCount / (job.requiredSkills.length || 1)) * 100)
          };
        }).sort((a: any, b: any) => b.matchPercent - a.matchPercent);

        setMatchedJobs(rankedJobs.slice(0, 3));

        // If roadmap exists, load active progress
        if (userRoadmaps.length > 0 && userRoadmaps[0].id) {
          const prog = await getLearningProgress(currentUser.uid, userRoadmaps[0].id);
          setActiveProgress(prog);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [currentUser, userProfile]);

  const targetRole = userProfile?.targetJobRole || 'Full Stack Cloud Engineer';
  const latestGapReport = gapReports[0] || null;
  const matchScore = latestGapReport ? latestGapReport.matchScore : 50;

  const barChartData = trends.map(t => ({
    name: t.skillName,
    frequency: t.demandFrequency
  }));

  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isDemoUser && (
        <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-700/60 text-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-900/80 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Evaluation Mode Active
              </p>
              <p className="text-blue-300/90 text-[11px] mt-0.5">
                Exploring as a demo student with pre-populated sample skills, gap analysis, and micro-credential roadmap.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-800 text-blue-300 self-start sm:self-auto">
            Demo ID: {currentUser?.uid.slice(0, 8)}...
          </span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Target Role: {targetRole}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {userProfile?.displayName || 'Student'}!
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your personalized curriculum platform is synchronized with verified job market requirements. Review your skill gaps, monitor course completion, and advance your micro-credential journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              {analysis ? 'Re-Analyze Resume' : 'Upload Resume'}
            </Link>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              View Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Skill Match Score"
          value={`${matchScore}%`}
          subtitle={`Against ${targetRole}`}
          icon={Target}
          badge={matchScore >= 70 ? 'High' : matchScore >= 45 ? 'Moderate' : 'Needs Focus'}
          badgeColor={matchScore >= 70 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Confirmed Skills"
          value={userProfile?.confirmedSkills?.length || analysis?.extractedSkills?.length || 0}
          subtitle="Validated in profile"
          icon={FileText}
          badge="Verified"
          badgeColor="indigo"
        />
        <StatCard
          title="Missing Priority Gaps"
          value={latestGapReport?.missingSkills?.length || 4}
          subtitle="Demanded by recruiters"
          icon={AlertTriangle}
          badge="Actionable"
          badgeColor="purple"
        />
        <StatCard
          title="Active Micro-Credential"
          value={roadmaps.length > 0 ? `${activeProgress?.percentComplete || 20}%` : 'Not Started'}
          subtitle={roadmaps.length > 0 ? roadmaps[0].microCredentialTitle : 'Generate from gap report'}
          icon={Award}
          badge={roadmaps.length > 0 ? 'In Progress' : 'Pending'}
          badgeColor={roadmaps.length > 0 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Two Column Layout: Charts & Skill Match status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Market Demand Graph & Gaps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Market Skill Demand Chart */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Real Job-Market Skill Demand Frequency
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Derived from active permitted enterprise listings in the dataset.
                </p>
              </div>
              <Link to="/trends" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Explore All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`${val}% of Postings`, 'Demand']}
                  />
                  <Bar dataKey="frequency" radius={[6, 6, 0, 0]}>
                    {barChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Breakdown: Matched vs Gaps */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Target Skill Alignment ({targetRole})
              </h3>
              <Link to="/gap-analysis" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Deep Analysis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Matched skills */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Skills You Have ({latestGapReport?.matchedSkills?.length || userProfile?.confirmedSkills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-2">
                  {(latestGapReport?.matchedSkills || userProfile?.confirmedSkills || ['React', 'JavaScript', 'Git', 'Python']).map(skill => (
                    <Badge key={skill} variant="success" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing skills */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Priority Missing Skills ({latestGapReport?.missingSkills?.length || 4})
                </p>
                <div className="flex flex-wrap gap-2">
                  {(latestGapReport?.missingSkills || ['Docker', 'Kubernetes', 'AWS', 'PostgreSQL']).map(skill => (
                    <Badge key={skill} variant="danger" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap Status & Recommended Next Actions */}
        <div className="space-y-6">
          {/* Current Micro-Credential Roadmap Card */}
          <div className="rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-800/40 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Active Roadmap
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {activeProgress ? `${activeProgress.percentComplete}% Complete` : 'Initial Phase'}
              </span>
            </div>

            <h4 className="text-base font-bold text-white">
              {roadmaps.length > 0 ? roadmaps[0].microCredentialTitle : `${targetRole} Micro-Credential`}
            </h4>

            <p className="text-xs text-slate-300 mt-2 line-clamp-3">
              {roadmaps.length > 0
                ? roadmaps[0].summary
                : 'Competency-based sequential curriculum designed to bridge high-demand skills for tech recruiters.'}
            </p>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Curriculum Progress</span>
                <span className="font-mono text-slate-200">{activeProgress?.percentComplete || 25}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${activeProgress?.percentComplete || 25}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to="/progress"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-all shadow-md"
              >
                Continue Coursework
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Recommended Learning Resources */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Recommended Courses
              </h4>
              <Link to="/courses" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {featuredCourses.map(course => (
                <a
                  key={course.id}
                  href={course.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-600/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide">
                      {course.provider}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {course.estimatedDuration}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-1 group-hover:text-white line-clamp-1">
                    {course.title}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Matched Job Opportunities */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Relevant Job Opportunities
              </h4>
              <Link to="/jobs" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {matchedJobs.map(job => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[170px]">
                      {job.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {job.company} • {job.location.split('/')[0]}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {(job as any).matchPercent || 75}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
