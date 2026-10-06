import React from 'react';
import { AgentStats } from '../types';

interface StatsCardsProps {
  stats: AgentStats | null;
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/40 animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"
          />
        ))}
      </div>
    );
  }

  const total = stats?.total || 0;
  const active = stats?.byStatus?.ACTIVE || 0;
  const onDuty = stats?.byStatus?.ON_DUTY || 0;
  const areasCount = stats?.byArea ? Object.keys(stats.byArea).length : 0;
  const avgRating = stats?.averageRating ? stats.averageRating.toFixed(2) : '5.00';

  const metrics = [
    {
      label: 'Total Agents',
      value: total,
      subtext: `${active + onDuty} on active duty`,
    },
    {
      label: 'Active & Available',
      value: active,
      subtext: `${onDuty} in transit / assigned`,
    },
    {
      label: 'Coverage Zones',
      value: areasCount,
      subtext: 'Active service areas',
    },
    {
      label: 'Fleet Score',
      value: avgRating,
      subtext: 'Average rating (out of 5.0)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="p-4 rounded-lg bg-white dark:bg-[#16171d] border border-zinc-200/80 dark:border-zinc-800/80 shadow-subtle transition-all"
        >
          <div className="text-[11px] font-medium tracking-wide uppercase text-zinc-400 dark:text-zinc-500 mb-1">
            {m.label}
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {m.value}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {m.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
