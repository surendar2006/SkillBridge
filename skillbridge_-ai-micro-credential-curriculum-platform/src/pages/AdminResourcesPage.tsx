import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getLearningResources,
  addLearningResource,
  updateLearningResource,
  deleteLearningResource
} from '../lib/dataService';
import { LearningResource } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Search,
  BookOpen
} from 'lucide-react';

export const AdminResourcesPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState<'NPTEL' | 'Coursera' | 'edX' | 'Udemy' | 'Official Documentation' | 'Stanford Online'>('NPTEL');
  const [skillsCoveredInput, setSkillsCoveredInput] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [estimatedDuration, setEstimatedDuration] = useState('8 Weeks');
  const [officialUrl, setOfficialUrl] = useState('');
  const [type, setType] = useState<'micro_credential' | 'course' | 'certification'>('micro_credential');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      setLoading(true);
      const data = await getLearningResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingResource(null);
    setTitle('');
    setProvider('NPTEL');
    setSkillsCoveredInput('');
    setDifficulty('Intermediate');
    setEstimatedDuration('8 Weeks');
    setOfficialUrl('https://nptel.ac.in');
    setType('micro_credential');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res: LearningResource) => {
    setEditingResource(res);
    setTitle(res.title);
    setProvider(res.provider as any);
    setSkillsCoveredInput(res.skillsCovered.join(', '));
    setDifficulty(res.difficulty);
    setEstimatedDuration(res.estimatedDuration);
    setOfficialUrl(res.officialUrl);
    setType(res.type as any);
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const skillsArray = skillsCoveredInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      if (editingResource) {
        await updateLearningResource(editingResource.id, {
          title,
          provider,
          skillsCovered: skillsArray,
          difficulty,
          estimatedDuration,
          officialUrl,
          type
        });
        setFeedback('Resource updated successfully.');
      } else {
        await addLearningResource({
          title,
          provider,
          skillsCovered: skillsArray,
          difficulty,
          estimatedDuration,
          officialUrl,
          isVerified: true,
          type,
          updatedAt: new Date().toISOString()
        });
        setFeedback('New accredited resource registered.');
      }
      setIsModalOpen(false);
      await loadResources();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Save resource error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteLearningResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      setFeedback('Resource removed.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Delete resource error:', err);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-rose-400">Access Denied</div>;
  }

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.skillsCovered.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Learning Resource Catalog Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curate accredited courses, micro-credentials, and certifications recommended to students.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Learning Resource
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, provider, or skills..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Title & Provider</th>
                <th className="py-3 px-4">Skills Covered</th>
                <th className="py-3 px-4">Level & Duration</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResources.map(res => (
                <tr key={res.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{res.title}</p>
                    <p className="text-[11px] text-indigo-400 font-semibold mt-0.5">{res.provider}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {res.skillsCovered.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <p className="font-medium">{res.difficulty}</p>
                    <p className="text-[10px] text-slate-400">{res.estimatedDuration}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {res.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(res)}
                        className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete resource"
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? 'Edit Resource' : 'Add Accredited Learning Resource'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveResource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Provider</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="NPTEL">NPTEL</option>
                <option value="Coursera">Coursera</option>
                <option value="edX">edX</option>
                <option value="Official Documentation">Official Documentation</option>
                <option value="Stanford Online">Stanford Online</option>
                <option value="Udemy">Udemy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Format Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="micro_credential">Micro-Credential</option>
                <option value="certification">Certification</option>
                <option value="course">Course</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 8 Weeks, 40 Hours"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Skills Covered (comma separated)
            </label>
            <input
              type="text"
              value={skillsCoveredInput}
              onChange={e => setSkillsCoveredInput(e.target.value)}
              placeholder="e.g. Docker, Kubernetes, Linux"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Official Portal URL</label>
            <input
              type="url"
              value={officialUrl}
              onChange={e => setOfficialUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              {saving ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
