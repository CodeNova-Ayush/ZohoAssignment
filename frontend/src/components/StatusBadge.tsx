import React from 'react';
import { AgentStatus } from '../types';

interface StatusBadgeProps {
  status: AgentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<AgentStatus, { dot: string; label: string }> = {
    ACTIVE: {
      dot: 'bg-emerald-500',
      label: 'Active',
    },
    ON_DUTY: {
      dot: 'bg-sky-500 animate-pulse',
      label: 'On Duty',
    },
    OFF_DUTY: {
      dot: 'bg-zinc-400 dark:bg-zinc-500',
      label: 'Off Duty',
    },
    INACTIVE: {
      dot: 'bg-amber-500',
      label: 'Inactive',
    },
    SUSPENDED: {
      dot: 'bg-rose-500',
      label: 'Suspended',
    },
  };

  const config = configs[status] || configs.ACTIVE;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium rounded-full bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="tracking-tight">{config.label}</span>
    </span>
  );
};
