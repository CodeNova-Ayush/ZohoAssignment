import React from 'react';
import { Eye, Edit2, Trash2, Mail, Phone, MapPin, Star, ChevronLeft, ChevronRight, Bike, Truck, Car } from 'lucide-react';
import { DeliveryAgent, PaginationMeta } from '../types';
import { StatusBadge } from './StatusBadge';

interface AgentGridProps {
  agents: DeliveryAgent[];
  pagination: PaginationMeta;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onView: (agent: DeliveryAgent) => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({
  agents,
  pagination,
  loading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const getVehicleIcon = (type?: string) => {
    switch (type) {
      case 'MOTORCYCLE':
      case 'BICYCLE':
        return <Bike className="h-3.5 w-3.5 text-zinc-400" />;
      case 'VAN':
        return <Truck className="h-3.5 w-3.5 text-zinc-400" />;
      case 'CAR':
        return <Car className="h-3.5 w-3.5 text-zinc-400" />;
      default:
        return <Bike className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-lg animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"
          />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16171d] rounded-lg p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80 shadow-subtle">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No delivery agents found
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-4">
        {agents.map((agent) => {
          const loadPercentage = Math.min(
            100,
            Math.round(((agent.currentLoad || 0) / (agent.maxCapacity || 10)) * 100)
          );

          return (
            <div
              key={agent.id}
              className="p-4 rounded-lg bg-white dark:bg-[#16171d] border border-zinc-200/80 dark:border-zinc-800/80 shadow-subtle flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold flex items-center justify-center text-xs border border-zinc-200/60 dark:border-zinc-700/60">
                      {agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {agent.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {agent.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} size="sm" />
                </div>

                {/* Details */}
                <div className="space-y-1.5 py-2.5 text-xs border-t border-b border-zinc-100 dark:border-zinc-800/60 my-2">
                  <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300">
                    <Mail className="h-3 w-3 text-zinc-400" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300">
                    <Phone className="h-3 w-3 text-zinc-400" />
                    <span>{agent.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    <span>{agent.serviceArea}</span>
                  </div>
                </div>

                {/* Load Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                    <span className="flex items-center space-x-1">
                      {getVehicleIcon(agent.vehicleType)}
                      <span className="capitalize">
                        {agent.vehicleType?.toLowerCase() || 'Standard'}
                      </span>
                    </span>
                    <span className="font-mono text-[10px]">
                      {agent.currentLoad || 0}/{agent.maxCapacity || 10} pkgs
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full"
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center space-x-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{agent.rating ? agent.rating.toFixed(1) : '5.0'}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onView(agent)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                    title="View details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onEdit(agent)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                    title="Edit agent"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(agent)}
                    className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                    title="Delete agent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} agents)
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-1 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="p-1 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
