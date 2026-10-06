import React from 'react';
import { Eye, Edit2, Trash2, Mail, Phone, ChevronLeft, ChevronRight, Truck, Bike, Car, Star } from 'lucide-react';
import { DeliveryAgent, PaginationMeta, AgentStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface AgentTableProps {
  agents: DeliveryAgent[];
  pagination: PaginationMeta;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onView: (agent: DeliveryAgent) => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
  onQuickStatusChange: (agent: DeliveryAgent, newStatus: AgentStatus) => void;
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  pagination,
  loading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onQuickStatusChange,
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
      <div className="bg-white dark:bg-[#16171d] rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-subtle">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16171d] rounded-lg p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80 shadow-subtle">
        <div className="h-10 w-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <Truck className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No delivery agents found
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
          No records match your active search or filter criteria. Try adjusting your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16171d] rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-subtle transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
          <thead className="bg-zinc-50/75 dark:bg-[#121316] text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200/80 dark:border-zinc-800/80">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Service Area</th>
              <th className="px-3 py-3">Vehicle</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-sans">
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group"
              >
                {/* Agent Name & ID */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-7 w-7 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold flex items-center justify-center text-[11px] border border-zinc-200/60 dark:border-zinc-700/60">
                      {agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white">
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {agent.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-400">
                      <Mail className="h-3 w-3 text-zinc-400" />
                      <a
                        href={`mailto:${agent.email}`}
                        className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                      >
                        {agent.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px]">
                      <Phone className="h-3 w-3 text-zinc-400" />
                      <span>{agent.phone}</span>
                    </div>
                  </div>
                </td>

                {/* Service Area */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium border border-zinc-200/60 dark:border-zinc-700/60">
                    {agent.serviceArea}
                  </span>
                </td>

                {/* Vehicle */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-400">
                    {getVehicleIcon(agent.vehicleType)}
                    <span className="capitalize text-[11px]">
                      {agent.vehicleType?.toLowerCase() || 'Standard'}
                    </span>
                  </div>
                </td>

                {/* Status with Quick Toggle */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    <StatusBadge status={agent.status} size="sm" />
                    <select
                      value={agent.status}
                      onChange={(e) =>
                        onQuickStatusChange(agent, e.target.value as AgentStatus)
                      }
                      title="Quick update status"
                      className="bg-transparent text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 outline-none cursor-pointer"
                    >
                      <option value="ACTIVE" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Active</option>
                      <option value="ON_DUTY" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">On Duty</option>
                      <option value="OFF_DUTY" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Off Duty</option>
                      <option value="INACTIVE" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Inactive</option>
                      <option value="SUSPENDED" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Suspended</option>
                    </select>
                  </div>
                </td>

                {/* Rating */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{agent.rating ? agent.rating.toFixed(1) : '5.0'}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onView(agent)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(agent)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                      title="Edit Agent"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(agent)}
                      className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                      title="Delete Agent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-[#121316] border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Page <span className="font-medium text-zinc-800 dark:text-zinc-200">{pagination.page}</span> of{' '}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{pagination.totalPages || 1}</span> ({pagination.total} agents)
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
