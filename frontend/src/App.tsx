import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FiltersBar } from './components/FiltersBar';
import { AgentTable } from './components/AgentTable';
import { AgentGrid } from './components/AgentGrid';
import { AgentFormModal } from './components/AgentFormModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { agentApi } from './services/api';
import {
  DeliveryAgent,
  PaginationMeta,
  AgentFilterParams,
  AgentStats,
  ApiResponseMeta,
  AgentStatus,
} from './types';

export const App: React.FC = () => {
  // Theme state: default to dark grey (YC aesthetic) with easy toggle
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('yc_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yc_theme', 'light');
    }
  }, [darkMode]);

  // Main data states
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState<AgentStats | null>(null);

  // Filters state
  const [filters, setFilters] = useState<AgentFilterParams>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    serviceArea: '',
    vehicleType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // UI state
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);
  const [isPurging, setIsPurging] = useState(false);
  const [lastResponseMeta, setLastResponseMeta] = useState<ApiResponseMeta | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<DeliveryAgent | null>(null);
  const [viewingAgentMeta, setViewingAgentMeta] = useState<ApiResponseMeta | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<DeliveryAgent | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch agents list
  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.getAgents(filters);
      setAgents(res.data);
      setPagination(res.pagination);
      setLastResponseMeta(res.meta);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch delivery agents', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch analytical stats
  const loadStats = useCallback(async () => {
    try {
      const res = await agentApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.warn('Failed to load fleet stats:', err);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Unique service areas list for dropdown
  const serviceAreas = useMemo(() => {
    const areas = new Set<string>();
    if (stats?.byArea) {
      Object.keys(stats.byArea).forEach((a) => areas.add(a));
    }
    agents.forEach((a) => areas.add(a.serviceArea));
    return Array.from(areas).sort();
  }, [stats, agents]);

  // Handlers
  const handleFilterChange = (newFilters: Partial<AgentFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewAgent = async (agent: DeliveryAgent) => {
    try {
      const res = await agentApi.getAgentById(agent.id);
      setViewingAgent(res.data);
      setViewingAgentMeta(res.meta);
    } catch {
      setViewingAgent(agent);
      setViewingAgentMeta(null);
    }
  };

  const handleCreateAgent = async (formData: Partial<DeliveryAgent>) => {
    await agentApi.createAgent(formData);
    addToast('Delivery agent created successfully.', 'success');
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      serviceArea: '',
      vehicleType: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    loadStats();
  };

  const handleUpdateAgent = async (formData: Partial<DeliveryAgent>) => {
    if (!editingAgent) return;
    await agentApi.updateAgent(editingAgent.id, formData);
    addToast('Agent details updated.', 'success');
    setEditingAgent(null);
    loadAgents();
    loadStats();
  };

  const handleDeleteAgent = async (id: string) => {
    await agentApi.deleteAgent(id);
    addToast('Agent removed successfully.', 'success');
    setDeletingAgent(null);
    loadAgents();
    loadStats();
  };

  const handleQuickStatusChange = async (agent: DeliveryAgent, newStatus: AgentStatus) => {
    try {
      await agentApi.updateAgent(agent.id, { status: newStatus });
      addToast(`Updated ${agent.name} status to ${newStatus}`, 'success');
      loadAgents();
      loadStats();
    } catch (err: any) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      await agentApi.purgeCache();
      addToast('Redis cache purged. Subsequent queries fetch from PostgreSQL.', 'info');
      await loadAgents();
      await loadStats();
    } catch (err: any) {
      addToast(err.message || 'Failed to purge cache', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#0e0f12] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* YC Minimal Header */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        onPurgeCache={handlePurgeCache}
        isPurging={isPurging}
        lastResponseMeta={lastResponseMeta}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics */}
        <StatsCards stats={stats} loading={loading} />

        {/* Filters and Search */}
        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          serviceAreas={serviceAreas}
        />

        {/* Agent Directory Listing */}
        {viewMode === 'table' ? (
          <AgentTable
            agents={agents}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onView={handleViewAgent}
            onEdit={(a) => setEditingAgent(a)}
            onDelete={(a) => setDeletingAgent(a)}
            onQuickStatusChange={handleQuickStatusChange}
          />
        ) : (
          <AgentGrid
            agents={agents}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onView={handleViewAgent}
            onEdit={(a) => setEditingAgent(a)}
            onDelete={(a) => setDeletingAgent(a)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-4 text-center text-[11px] text-zinc-500 font-mono">
        SwiftDispatch • PostgreSQL + Redis (Cache-Aside) + Express + React
      </footer>

      {/* Create Modal */}
      <AgentFormModal
        isOpen={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateAgent}
      />

      {/* Edit Modal */}
      <AgentFormModal
        isOpen={Boolean(editingAgent)}
        mode="edit"
        initialData={editingAgent}
        onClose={() => setEditingAgent(null)}
        onSubmit={handleUpdateAgent}
      />

      {/* View Detail Modal */}
      <AgentDetailModal
        isOpen={Boolean(viewingAgent)}
        agent={viewingAgent}
        meta={viewingAgentMeta}
        onClose={() => setViewingAgent(null)}
        onEdit={(a) => setEditingAgent(a)}
        onDelete={(a) => setDeletingAgent(a)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingAgent)}
        agent={deletingAgent}
        onClose={() => setDeletingAgent(null)}
        onConfirm={handleDeleteAgent}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
