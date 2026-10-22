import React, { useState, useEffect } from 'react';
import { getJobPostings, calculateAndGetSkillTrends } from '../lib/dataService';
import { JobPosting, SkillTrendRecord } from '../types';
import { Badge } from '../components/common/Badge';
import {
  TrendingUp,
  Filter,
  BarChart3,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const SkillTrendsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [trends, setTrends] = useState<SkillTrendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const postings = await getJobPostings();
        setJobs(postings);
        const calculated = await calculateAndGetSkillTrends(postings);
        setTrends(calculated);
      } catch (err) {
        console.error('Failed to load skill trends:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Languages', 'Frameworks', 'Cloud & DevOps', 'Databases', 'AI & ML', 'Tools & Protocols'];
  const uniqueRoles = ['All', ...Array.from(new Set(jobs.map(j => j.title)))];

  const filteredTrends = trends.filter(trend => {
    const matchesCategory = categoryFilter === 'All' || trend.category === categoryFilter;
    const matchesSearch = trend.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || trend.topRoles.includes(selectedRole);
    return matchesCategory && matchesSearch && matchesRole;
  });

  // Calculate category distribution for pie chart
  const categoryCountMap: Record<string, number> = {};
  trends.forEach(t => {
    categoryCountMap[t.category] = (categoryCountMap[t.category] || 0) + 1;
  });
  const pieData = Object.entries(categoryCountMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 text-xs font-semibold mb-2">
          <Database className="w-3.5 h-3.5" />
          Active Dataset: {jobs.length} Permitted Job Records
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          Job-Market Skill Trends & Demand Frequency
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Objective frequencies computed directly from active job market postings in the platform's database. No fabricated statistics—honest demand ratios.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by skill name (e.g. Docker, Python)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Role Comparison Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Role Filter:</span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {uniqueRoles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Bar Chart: Top Skills in Filter */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <h2 className="text-base font-semibold text-white flex items-center justify-between mb-4">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Skill Demand Frequency (% of Job Postings)
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Showing top {Math.min(filteredTrends.length, 10)}
            </span>
          </h2>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredTrends.slice(0, 10).map(t => ({ name: t.skillName, freq: t.demandFrequency }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
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
                  formatter={(val: any) => [`${val}% of Postings`, 'Frequency']}
                />
                <Bar dataKey="freq" radius={[6, 6, 0, 0]}>
                  {filteredTrends.slice(0, 10).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-purple-400" />
            Skill Category Distribution
          </h2>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={`slice-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name}
                </span>
                <span className="font-mono text-slate-400">{d.value} skills</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Skill Demand Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <h2 className="text-base font-semibold text-white mb-4">
          Aggregated Dataset Records ({filteredTrends.length} skills)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Market Demand</th>
                <th className="py-3 px-4">Recruitment Tag</th>
                <th className="py-3 px-4">Top Requesting Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTrends.map(trend => (
                <tr key={trend.skillName} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {trend.skillName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                      {trend.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                    {trend.demandFrequency}%
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        trend.growthTag === 'Surging'
                          ? 'success'
                          : trend.growthTag === 'High Demand'
                          ? 'primary'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {trend.growthTag}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {trend.topRoles.join(', ') || 'Various Roles'}
                  </td>
                </tr>
              ))}
              {filteredTrends.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    No skills matched the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
