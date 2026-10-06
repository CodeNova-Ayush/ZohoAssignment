import React from 'react';
import { Search, LayoutGrid, LayoutList, ArrowUpDown, X } from 'lucide-react';
import { AgentFilterParams, AgentStatus, VehicleType } from '../types';

interface FiltersBarProps {
  filters: AgentFilterParams;
  onFilterChange: (newFilters: Partial<AgentFilterParams>) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  serviceAreas: string[];
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  serviceAreas,
}) => {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');

  React.useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange({ search: searchTerm, page: 1 });
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.serviceArea) ||
    Boolean(filters.vehicleType);

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      search: '',
      status: '',
      serviceArea: '',
      vehicleType: '',
      page: 1,
    });
  };

  return (
    <div className="bg-white dark:bg-[#16171d] rounded-lg p-2.5 sm:p-3 mb-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-subtle transition-colors">
      <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search agents by name, email, phone, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-md border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={clearFilters}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({ status: (e.target.value as AgentStatus) || '', page: 1 })
            }
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_DUTY">On Duty</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* Area selector */}
          <select
            value={filters.serviceArea || ''}
            onChange={(e) => onFilterChange({ serviceArea: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition max-w-[150px] truncate"
          >
            <option value="">All Areas</option>
            {serviceAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Vehicle selector */}
          <select
            value={filters.vehicleType || ''}
            onChange={(e) =>
              onFilterChange({ vehicleType: (e.target.value as VehicleType) || '', page: 1 })
            }
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition"
          >
            <option value="">All Vehicles</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="CAR">Car</option>
            <option value="VAN">Van</option>
            <option value="BICYCLE">Bicycle</option>
            <option value="WALKER">Walker</option>
          </select>

          {/* Sort selector */}
          <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-[#111215] rounded-md border border-zinc-200 dark:border-zinc-800 px-1 py-0.5">
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
              className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none px-1.5 py-1"
            >
              <option value="createdAt">Date</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() =>
                onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
              }
              title={`Sorting ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition"
            >
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md border border-rose-200 dark:border-rose-900/50 transition flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center space-x-0.5 bg-zinc-50 dark:bg-[#111215] p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 ml-auto">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="Table view"
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
