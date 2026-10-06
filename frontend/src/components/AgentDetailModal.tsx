import React, { useState } from 'react';
import { X, Copy, Check, Mail, Phone, MapPin, Truck, Calendar, Clock, Star, Zap, Edit2, Trash2 } from 'lucide-react';
import { DeliveryAgent, ApiResponseMeta } from '../types';
import { StatusBadge } from './StatusBadge';

interface AgentDetailModalProps {
  agent: DeliveryAgent | null;
  meta?: ApiResponseMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  meta,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !agent) return null;

  const copyId = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCacheHit = meta?.cached ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#16171d] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold flex items-center justify-center text-sm border border-zinc-200/60 dark:border-zinc-700/60">
              {agent.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                {agent.name}
              </h3>
              <div className="mt-1">
                <StatusBadge status={agent.status} size="sm" />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          {/* Redis Provenance Telemetry Banner */}
          {meta && (
            <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-400">
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-sans font-medium">Redis Cache Provenance:</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    isCacheHit
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isCacheHit ? 'HIT (from Redis)' : 'MISS (from Postgres)'}
                </span>
                {meta.durationMs !== undefined && (
                  <span className="text-zinc-400 dark:text-zinc-500">
                    {meta.durationMs}ms
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Agent UUID */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Agent ID (UUID)
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              <span className="truncate mr-2">{agent.id}</span>
              <button
                onClick={copyId}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition flex items-center space-x-1 shrink-0"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-zinc-400 flex items-center space-x-1 mb-1 text-[11px]">
                <Mail className="h-3 w-3 text-zinc-400" />
                <span>Email</span>
              </span>
              <a
                href={`mailto:${agent.email}`}
                className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium truncate block"
              >
                {agent.email}
              </a>
            </div>

            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-zinc-400 flex items-center space-x-1 mb-1 text-[11px]">
                <Phone className="h-3 w-3 text-zinc-400" />
                <span>Phone</span>
              </span>
              <a
                href={`tel:${agent.phone}`}
                className="text-zinc-900 dark:text-zinc-100 font-medium truncate block"
              >
                {agent.phone}
              </a>
            </div>
          </div>

          {/* Service Area & Vehicle Info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-zinc-400 flex items-center space-x-1 mb-1 text-[11px]">
                <MapPin className="h-3 w-3 text-zinc-400" />
                <span>Service Area</span>
              </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">{agent.serviceArea}</span>
            </div>

            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-zinc-400 flex items-center space-x-1 mb-1 text-[11px]">
                <Truck className="h-3 w-3 text-zinc-400" />
                <span>Vehicle & Load</span>
              </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">
                {agent.vehicleType?.toLowerCase() || 'Standard'} ({agent.currentLoad || 0}/{agent.maxCapacity || 10})
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500">Performance Score</span>
            <div className="flex items-center space-x-1 font-semibold text-zinc-900 dark:text-zinc-100">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{agent.rating ? agent.rating.toFixed(1) : '5.0'} / 5.0</span>
            </div>
          </div>

          {/* Notes */}
          {agent.notes && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                Operational Notes
              </div>
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {agent.notes}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-400 dark:text-zinc-500 space-y-1">
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-3 w-3" />
              <span>Created: {new Date(agent.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="h-3 w-3" />
              <span>Updated: {new Date(agent.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#121316] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(agent);
            }}
            className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition flex items-center space-x-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition border border-zinc-200 dark:border-zinc-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(agent);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-white dark:hover:bg-zinc-100 rounded-md transition flex items-center space-x-1 shadow-sm"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit Agent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
