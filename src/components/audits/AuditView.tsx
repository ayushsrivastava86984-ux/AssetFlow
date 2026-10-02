import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditItemStatus } from '../../types';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Plus,
  FileText,
  Search,
  Check,
  ShieldCheck,
  User,
  Calendar,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const AuditView: React.FC = () => {
  const {
    auditCycles,
    auditItems,
    assets,
    departments,
    createAuditCycle,
    verifyAuditItem,
    closeAuditCycle,
    currentUser,
  } = useApp();

  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    auditCycles[0]?.id || ''
  );

  // New cycle modal
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [cycleTitle, setCycleTitle] = useState('');
  const [cycleDeptId, setCycleDeptId] = useState<string>(departments[0]?.id || '');
  const [cycleLocation, setCycleLocation] = useState('Building B, Floor 2');
  const [cycleStartDate, setCycleStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [cycleEndDate, setCycleEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Item verification modal
  const [verifyingItemId, setVerifyingItemId] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<AuditItemStatus>('Verified');
  const [verifyNotes, setVerifyNotes] = useState('');

  const activeCycle = auditCycles.find((c) => c.id === selectedCycleId);
  const cycleItems = auditItems.filter((i) => i.cycleId === selectedCycleId);

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleTitle.trim()) return;

    const res = createAuditCycle({
      title: cycleTitle.trim(),
      departmentId: cycleDeptId || undefined,
      location: cycleLocation.trim() || undefined,
      startDate: cycleStartDate,
      endDate: cycleEndDate,
    });

    if (res.success) {
      setIsNewCycleOpen(false);
      setCycleTitle('');
    }
  };

  const handleConfirmVerification = () => {
    if (!verifyingItemId) return;
    verifyAuditItem(verifyingItemId, verifyStatus, verifyNotes.trim());
    setVerifyingItemId(null);
    setVerifyNotes('');
  };

  const isClosed = activeCycle?.status === 'Closed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Physical Asset Audits & Reconciliation</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
              Discrepancy Reporting
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Conduct cyclic physical verifications, flag missing or damaged equipment, and generate locked audit records.
          </p>
        </div>

        <button
          onClick={() => setIsNewCycleOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Audit Cycle</span>
        </button>
      </div>

      {/* Audit Cycles Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {auditCycles.map((cycle) => {
          const isSelected = cycle.id === selectedCycleId;
          const percentVerified = Math.round((cycle.verifiedCount / (cycle.totalAssetsCount || 1)) * 100);

          return (
            <div
              key={cycle.id}
              onClick={() => setSelectedCycleId(cycle.id)}
              className={`p-4 rounded-xl border text-left transition-all shadow-xs cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge status={cycle.status} size="sm" />
                <span className="text-[11px] font-mono text-slate-400">
                  {cycle.startDate} → {cycle.endDate}
                </span>
              </div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white mt-2 line-clamp-1">
                {cycle.title}
              </h3>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {cycle.location || 'All Locations'}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Verified</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cycle.verifiedCount} / {cycle.totalAssetsCount} ({percentVerified}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentVerified}%` }}
                  ></div>
                </div>
              </div>

              {/* Discrepancy counters */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-rose-500 font-semibold">
                  Missing: {cycle.missingCount}
                </span>
                <span className="text-amber-500 font-semibold">
                  Damaged: {cycle.damagedCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Audit Cycle Verification Checklist */}
      {activeCycle && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeCycle.title}
                </h2>
                <Badge status={activeCycle.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeCycle.totalAssetsCount} Assets assigned for physical inspection
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isClosed ? (
                <button
                  onClick={() => closeAuditCycle(activeCycle.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock & Finalize Audit</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Audit Cycle Closed & Locked
                </span>
              )}
            </div>
          </div>

          {/* Items Checklist Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Asset Tag / Name</th>
                  <th className="py-3 px-4">Serial No.</th>
                  <th className="py-3 px-4">Expected Location</th>
                  <th className="py-3 px-4">Verification State</th>
                  <th className="py-3 px-4">Auditor Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cycleItems.map((item) => {
                  const asset = assets.find((a) => a.id === item.assetId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {asset?.assetTag}
                        </span>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset?.name}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {asset?.serialNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {asset?.location}
                      </td>

                      <td className="py-3 px-4">
                        <Badge status={item.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-slate-500 italic max-w-xs">
                        {item.notes || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isClosed ? (
                          <button
                            onClick={() => {
                              setVerifyingItemId(item.id);
                              setVerifyStatus(item.status === 'Pending' ? 'Verified' : item.status);
                              setVerifyNotes(item.notes || '');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Verify Asset</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verify Item Modal */}
      <Modal
        isOpen={!!verifyingItemId}
        onClose={() => setVerifyingItemId(null)}
        title="Physical Asset Inspection Sign-off"
        subtitle="Record physical observation, discrepancies, or missing flags"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Verification Finding *
            </label>
            <select
              value={verifyStatus}
              onChange={(e) => setVerifyStatus(e.target.value as AuditItemStatus)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Verified">Verified (Physically present and undamaged)</option>
              <option value="Damaged">Damaged (Physical damage or malfunction observed)</option>
              <option value="Missing">Missing (Equipment could not be located)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Auditor Observation Notes & Discrepancy Evidence
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Serial tag barcode scanned successfully. Minor hairline scratch on bezel."
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setVerifyingItemId(null)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmVerification}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              Submit Verification
            </button>
          </div>
        </div>
      </Modal>

      {/* New Audit Cycle Modal */}
      <Modal
        isOpen={isNewCycleOpen}
        onClose={() => setIsNewCycleOpen(false)}
        title="Initiate New Asset Audit Cycle"
        subtitle="Select scope by department and facility to populate verification items"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCycle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Audit Cycle Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 2026 Facility & Lab Comprehensive Audit"
              value={cycleTitle}
              onChange={(e) => setCycleTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Scope
              </label>
              <select
                value={cycleDeptId}
                onChange={(e) => setCycleDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Facility / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Building B"
                value={cycleLocation}
                onChange={(e) => setCycleLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={cycleStartDate}
                onChange={(e) => setCycleStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={cycleEndDate}
                onChange={(e) => setCycleEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewCycleOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Start Audit Cycle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
