import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAssetHealth } from '../../utils/assetHealth';
import {
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Wrench,
  Calendar,
  ClipboardX,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface NeedsAttentionSectionProps {
  onNavigate: (tab: string) => void;
}

export const NeedsAttentionSection: React.FC<NeedsAttentionSectionProps> = ({ onNavigate }) => {
  const {
    allocations,
    transfers,
    maintenanceRequests,
    auditItems,
    assets,
    users,
    bookings,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Overdue Returns
  const overdueAllocations = allocations.filter((a) => {
    if (a.status === 'Overdue') return true;
    if (a.status === 'Active' && a.expectedReturnDate < todayStr) return true;
    return false;
  });

  // 2. Pending Transfers
  const pendingTransfers = transfers.filter((t) => t.status === 'Pending' || t.status === 'pending');

  // 3. Pending Maintenance Approvals
  const pendingMaintenance = maintenanceRequests.filter(
    (m) => m.status === 'Pending' || m.status === 'pending'
  );

  // 4. Audit Discrepancies (Missing / Damaged)
  const auditDiscrepancies = auditItems.filter(
    (item) => item.status === 'Missing' || item.status === 'Damaged' || item.status === 'missing' || item.status === 'damaged'
  );

  // 5. Assets in Critical Health
  const criticalAssets = assets.filter((asset) => {
    const health = calculateAssetHealth(asset, maintenanceRequests, auditItems);
    return health.level === 'Critical' || health.level === 'Attention';
  });

  const totalAttentionItems =
    overdueAllocations.length +
    pendingTransfers.length +
    pendingMaintenance.length +
    auditDiscrepancies.length;

  if (totalAttentionItems === 0 && criticalAssets.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Operations Nominal — Zero Critical Attention Required
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
              No overdue returns, pending transfer bottlenecks, or unaddressed maintenance work orders.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/80 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                What Needs Your Attention Today
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {totalAttentionItems} item{totalAttentionItems === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Urgent lifecycle exceptions requiring custodian intervention or managerial sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Attention Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Overdue Returns */}
        <div
          onClick={() => onNavigate('allocations')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            overdueAllocations.length > 0
              ? 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              Overdue Returns
            </span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">
              {overdueAllocations.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {overdueAllocations.length > 0
              ? `${overdueAllocations.length} equipment past scheduled check-in`
              : 'All assets returned on time'}
          </div>
        </div>

        {/* Card 2: Pending Transfers */}
        <div
          onClick={() => onNavigate('allocations')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            pendingTransfers.length > 0
              ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-400'
              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              Pending Transfers
            </span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {pendingTransfers.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {pendingTransfers.length > 0
              ? 'Awaiting manager sign-off'
              : 'No pending custody handovers'}
          </div>
        </div>

        {/* Card 3: Pending Maintenance */}
        <div
          onClick={() => onNavigate('maintenance')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            pendingMaintenance.length > 0
              ? 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400'
              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              Maintenance Approvals
            </span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              {pendingMaintenance.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {pendingMaintenance.length > 0
              ? 'Unapproved work orders'
              : 'All reported tickets approved'}
          </div>
        </div>

        {/* Card 4: Audit Discrepancies */}
        <div
          onClick={() => onNavigate('audits')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            auditDiscrepancies.length > 0
              ? 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <ClipboardX className="w-3.5 h-3.5 text-rose-500" />
              Audit Discrepancies
            </span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">
              {auditDiscrepancies.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {auditDiscrepancies.length > 0
              ? `${auditDiscrepancies.length} missing or damaged asset(s)`
              : 'Zero unverified discrepancies'}
          </div>
        </div>
      </div>
    </div>
  );
};
