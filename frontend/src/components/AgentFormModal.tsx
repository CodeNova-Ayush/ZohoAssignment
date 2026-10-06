import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { DeliveryAgent, AgentStatus, VehicleType } from '../types';

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<DeliveryAgent>) => Promise<void>;
  initialData?: DeliveryAgent | null;
  mode: 'create' | 'edit';
}

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<DeliveryAgent>>({
    name: '',
    phone: '',
    email: '',
    serviceArea: '',
    status: 'ACTIVE',
    vehicleType: 'MOTORCYCLE',
    rating: 5.0,
    currentLoad: 0,
    maxCapacity: 10,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email,
        serviceArea: initialData.serviceArea,
        status: initialData.status,
        vehicleType: initialData.vehicleType || 'MOTORCYCLE',
        rating: initialData.rating || 5.0,
        currentLoad: initialData.currentLoad || 0,
        maxCapacity: initialData.maxCapacity || 10,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        serviceArea: '',
        status: 'ACTIVE',
        vehicleType: 'MOTORCYCLE',
        rating: 5.0,
        currentLoad: 0,
        maxCapacity: 10,
        notes: '',
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Enter a valid phone number (e.g. +1-202-555-0143)';
    }

    if (!formData.serviceArea?.trim()) {
      newErrors.serviceArea = 'Service area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        rating: Number(formData.rating),
        currentLoad: Number(formData.currentLoad),
        maxCapacity: Number(formData.maxCapacity),
      });
      onClose();
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        const fieldErrors: Record<string, string> = {};
        for (const d of err.details) {
          fieldErrors[d.field] = d.message;
        }
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.message || 'Failed to save delivery agent');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#16171d] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {mode === 'create' ? 'Create Delivery Agent' : 'Edit Agent'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {mode === 'create'
                ? 'Add a new courier record to the fleet'
                : `Update profile information for ${initialData?.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
          {generalError && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Jordan Smith"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border ${
                errors.name ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
              } focus:border-zinc-400 dark:focus:border-zinc-600 outline-none transition`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="jordan.s@courier.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border ${
                  errors.email ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                } focus:border-zinc-400 dark:focus:border-zinc-600 outline-none transition`}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="+1-202-555-0143"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border ${
                  errors.phone ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                } focus:border-zinc-400 dark:focus:border-zinc-600 outline-none transition`}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Service Area & Vehicle Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Service Area *
              </label>
              <input
                type="text"
                placeholder="e.g. Downtown Central"
                value={formData.serviceArea || ''}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                className={`w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border ${
                  errors.serviceArea ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                } focus:border-zinc-400 dark:focus:border-zinc-600 outline-none transition`}
              />
              {errors.serviceArea && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.serviceArea}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType || 'MOTORCYCLE'}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value as VehicleType })
                }
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition"
              >
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="CAR">Car</option>
                <option value="VAN">Van</option>
                <option value="BICYCLE">Bicycle</option>
                <option value="WALKER">Walker</option>
              </select>
            </div>
          </div>

          {/* Status & Max Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
              <select
                value={formData.status || 'ACTIVE'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as AgentStatus })
                }
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition"
              >
                <option value="ACTIVE">Active (Available)</option>
                <option value="ON_DUTY">On Duty (In Transit)</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Max Capacity (packages)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.maxCapacity || 10}
                onChange={(e) =>
                  setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 10 })
                }
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Performance Score (1.0 to 5.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={formData.rating || 5.0}
              onChange={(e) =>
                setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })
              }
              className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Primary courier for downtown financial district."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#111215] text-xs text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-800 focus:outline-none transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition border border-zinc-200 dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-white dark:hover:bg-zinc-100 rounded-md transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Create Agent' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
