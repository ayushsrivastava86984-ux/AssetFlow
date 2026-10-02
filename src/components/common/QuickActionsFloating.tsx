import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Boxes,
  CalendarPlus,
  Wrench,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  X,
  ChevronUp,
} from 'lucide-react';

interface QuickActionsFloatingProps {
  onNavigateTab: (tab: string) => void;
  onOpenAssetRegister: () => void;
  onOpenBookingModal: () => void;
  onOpenAllocateModal: () => void;
  onOpenMaintenanceModal: () => void;
  onOpenDemo: () => void;
}

export const QuickActionsFloating: React.FC<QuickActionsFloatingProps> = ({
  onNavigateTab,
  onOpenAssetRegister,
  onOpenBookingModal,
  onOpenAllocateModal,
  onOpenMaintenanceModal,
  onOpenDemo,
}) => {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const canRegister = currentUser.role === 'Admin' || currentUser.role === 'Asset Manager';
  const canAllocate = currentUser.role === 'Admin' || currentUser.role === 'Asset Manager' || currentUser.role === 'Department Head';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Floating Action Menu Popover */}
      {isOpen && (
        <div className="mb-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Action Center
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              {currentUser.role}
            </span>
          </div>

          <div className="py-1 space-y-0.5 text-xs">
            {canRegister && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAssetRegister();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Register Asset</div>
                  <div className="text-[10px] text-slate-400">Add physical inventory</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenBookingModal();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <CalendarPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Book Shared Resource</div>
                <div className="text-[10px] text-slate-400">Rooms, vehicles, AV equipment</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenMaintenanceModal();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Raise Maintenance</div>
                <div className="text-[10px] text-slate-400">Report issue / damaged hardware</div>
              </div>
            </button>

            {canAllocate ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAllocateModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Allocate Equipment</div>
                  <div className="text-[10px] text-slate-400">Assign asset with return date</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateTab('allocations');
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Request Transfer</div>
                  <div className="text-[10px] text-slate-400">Take over equipment custodian</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDemo();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2.5 text-blue-700 dark:text-blue-300 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
            >
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold">Signature Demo Walkthrough</div>
                <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70">
                  23-Step Scenario Automation
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
        className="w-13 h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
