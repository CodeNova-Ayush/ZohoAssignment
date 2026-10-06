import React from 'react';
import { Truck, RotateCw, Plus, Sun, Moon, Database, Zap } from 'lucide-react';
import { ApiResponseMeta } from '../types';

interface HeaderProps {
  onOpenCreate: () => void;
  onPurgeCache: () => void;
  isPurging: boolean;
  lastResponseMeta?: ApiResponseMeta | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  onPurgeCache,
  isPurging,
  lastResponseMeta,
  darkMode,
  onToggleDarkMode,
}) => {
  const isCacheHit = lastResponseMeta?.cached ?? false;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#121316]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm">
            <Truck className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              SwiftDispatch
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
              v1.0
            </span>
          </div>
        </div>

        {/* Right Telemetry & Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Real-time Redis Telemetry Pill */}
          {lastResponseMeta && (
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md text-xs font-mono border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center space-x-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isCacheHit ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="font-sans text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  Cache:
                </span>
                <span className="font-semibold text-[11px]">
                  {isCacheHit ? 'HIT' : 'MISS'}
                </span>
              </span>
              {lastResponseMeta.durationMs !== undefined && (
                <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                  {lastResponseMeta.durationMs}ms
                </span>
              )}
            </div>
          )}

          {/* Infrastructure status indicators */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center space-x-1" title="PostgreSQL Database Connected">
              <Database className="h-3 w-3 text-zinc-400" />
              <span>Postgres</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1" title="Redis Cache Connected">
              <Zap className="h-3 w-3 text-emerald-500" />
              <span>Redis</span>
            </span>
          </div>

          {/* Purge Cache Button */}
          <button
            onClick={onPurgeCache}
            disabled={isPurging}
            title="Purge Redis cache to test cold response"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-md transition disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isPurging ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Purge Cache</span>
          </button>

          {/* Theme Toggle (Light / Dark Grey) */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Grey' : 'Switch to Dark Grey'}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-md transition"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Add Agent CTA */}
          <button
            onClick={onOpenCreate}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-white dark:hover:bg-zinc-100 rounded-md shadow-sm transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Agent</span>
          </button>
        </div>
      </div>
    </header>
  );
};
