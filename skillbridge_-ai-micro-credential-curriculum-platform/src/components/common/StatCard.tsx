import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'indigo' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'indigo',
  trend
}) => {
  const badgeColors = {
    emerald: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
    indigo: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-800/40',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-750 text-indigo-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          {trend && <span className="font-medium text-emerald-400">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </p>
      )}
    </div>
  );
};
