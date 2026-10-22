import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getJobPostings,
  addJobPosting,
  updateJobPosting,
  deleteJobPosting
} from '../lib/dataService';
import { JobPosting } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const AdminDatasetsPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Lead'>('Mid');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [description, setDescription] = useState('');
  const [dataSource, setDataSource] = useState('Permitted University Tech Corpus');
  const [sourceUrl, setSourceUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await getJobPostings();
      setJobs(data);
    } catch (err) {
      console.error('Error loading dataset:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('');
    setLocation('Remote / Global');
    setExperienceLevel('Mid');
    setRequiredSkillsInput('');
    setDescription('');
    setDataSource('Permitted University Tech Corpus');
    setSourceUrl('https://careers.google.com');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: JobPosting) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setExperienceLevel(job.experienceLevel);
    setRequiredSkillsInput(job.requiredSkills.join(', '));
    setDescription(job.description);
    setDataSource(job.dataSource);
    setSourceUrl(job.sourceUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const skillsArray = requiredSkillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      if (editingJob) {
        await updateJobPosting(editingJob.id, {
          title,
          company,
          location,
          experienceLevel,
          requiredSkills: skillsArray,
          description,
          dataSource,
          sourceUrl
        });
        setFeedback('Job posting updated successfully.');
      } else {
        const newId = await addJobPosting({
          title,
          company,
          location,
          experienceLevel,
          requiredSkills: skillsArray,
          description,
          dataSource,
          sourceUrl,
          isDemonstration: true,
          updatedAt: new Date().toISOString()
        });
        setFeedback('New job posting added to active dataset.');
      }
      setIsModalOpen(false);
      await loadJobs();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJobPosting(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      setFeedback('Job posting removed from dataset.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleBulkImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              await addJobPosting({
                title: item.title || 'Software Engineer',
                company: item.company || 'Tech Enterprise',
                location: item.location || 'Remote',
                experienceLevel: item.experienceLevel || 'Mid',
                requiredSkills: item.requiredSkills || ['Python', 'SQL'],
                description: item.description || 'Job role description.',
                dataSource: item.dataSource || 'Administrator Bulk Import',
                sourceUrl: item.sourceUrl || '',
                isDemonstration: true,
                updatedAt: new Date().toISOString()
              });
            }
            await loadJobs();
            setFeedback(`Imported ${parsed.length} jobs successfully.`);
            setTimeout(() => setFeedback(null), 3000);
          }
        } catch (err) {
          setFeedback('Failed to parse uploaded JSON dataset file.');
          setTimeout(() => setFeedback(null), 4000);
        }
      };
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-rose-400">Access Denied</div>;
  }

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            Job Market Dataset Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain permitted job records that power real-time skill frequency calculations and gap analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleBulkImportJson} className="hidden" />
          </label>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Job Posting
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search and Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dataset by role, company, or skill..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Title & Company</th>
                <th className="py-3 px-4">Required Skills</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Data Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{job.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{job.company} • {job.location}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 4).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {s}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                      {job.experienceLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="block truncate max-w-[130px]">{job.dataSource}</span>
                    <span className="text-[10px] text-slate-500">{job.updatedAt}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit posting"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete posting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? 'Edit Job Posting' : 'Add New Permitted Job Record'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={requiredSkillsInput}
              onChange={e => setRequiredSkillsInput(e.target.value)}
              placeholder="e.g. React, TypeScript, Docker, AWS"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Data Source</label>
              <input
                type="text"
                value={dataSource}
                onChange={e => setDataSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Official Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              {saving ? 'Saving...' : 'Save Job Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
