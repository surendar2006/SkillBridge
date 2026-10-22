import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  Briefcase,
  CheckCircle2,
  User,
  Settings,
  ShieldAlert,
  Database,
  Layers,
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, userProfile } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resume', label: 'Resume Analysis', icon: FileText },
    { to: '/trends', label: 'Market Skill Trends', icon: TrendingUp },
    { to: '/gap-analysis', label: 'Skill-Gap Analysis', icon: Target },
    { to: '/roadmaps', label: 'Curriculum Roadmaps', icon: Sparkles },
    { to: '/courses', label: 'Courses & Certs', icon: BookOpen },
    { to: '/jobs', label: 'Job Matches', icon: Briefcase },
    { to: '/progress', label: 'Progress Tracker', icon: CheckCircle2 },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: ShieldAlert },
    { to: '/admin/datasets', label: 'Job Datasets', icon: Database },
    { to: '/admin/resources', label: 'Resource Catalog', icon: Layers },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-indigo-600/30 to-blue-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900/95 p-4 flex flex-col justify-between overflow-y-auto transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Target Role Badge */}
          {userProfile?.targetJobRole && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-800/40">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                Target Career
              </div>
              <p className="text-xs font-medium text-slate-200 mt-1 truncate">
                {userProfile.targetJobRole}
              </p>
            </div>
          )}

          {/* Student Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Student Platform
            </div>
            <nav className="space-y-1">
              {studentLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={linkClass}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Administrator Navigation */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-800">
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Administrator
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono">
                  Superuser
                </span>
              </div>
              <nav className="space-y-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => onClose()}
                      className={linkClass}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-purple-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom micro-credential info footer */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-300">Micro-Credential Standard</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Competency-aligned learning paths with verified real-world milestones.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
