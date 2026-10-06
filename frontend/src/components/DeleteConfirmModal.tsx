import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { DeliveryAgent } from '../types';

interface DeleteConfirmModalProps {
  agent: DeliveryAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  agent,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !agent) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(agent.id);
      onClose();
    } catch {
      // Handled in caller
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#16171d] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-5 relative">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="h-9 w-9 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Trash2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Delete Delivery Agent</h4>
            <p className="text-xs text-zinc-500">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 leading-relaxed">
          Are you sure you want to delete <strong className="text-zinc-900 dark:text-white">{agent.name}</strong> ({agent.email}) from <span className="font-medium text-zinc-800 dark:text-zinc-200">{agent.serviceArea}</span>?
        </p>

        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition border border-zinc-200 dark:border-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-md transition disabled:opacity-50 shadow-sm"
          >
            {deleting ? 'Deleting...' : 'Delete Agent'}
          </button>
        </div>
      </div>
    </div>
  );
};
