import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AssetCondition } from '../../types';
import {
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Check,
  X,
  Plus,
  ShieldCheck,
  User,
  History,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface AllocationViewProps {
  initialAssetId?: string;
}

export const AllocationView: React.FC<AllocationViewProps> = ({ initialAssetId }) => {
  const {
    assets,
    allocations,
    transfers,
    users,
    departments,
    allocateAsset,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    returnAsset,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'transfers' | 'history'>('active');

  // Allocate Modal
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [allocAssetId, setAllocAssetId] = useState(initialAssetId || assets[0]?.id || '');
  const [allocEmployeeId, setAllocEmployeeId] = useState(users[0]?.id || '');
  const [allocExpectedReturn, setAllocExpectedReturn] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [allocError, setAllocError] = useState('');
  const [allocSuccess, setAllocSuccess] = useState('');

  // Transfer Modal
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAssetId, setTransferAssetId] = useState(assets[0]?.id || '');
  const [transferToEmpId, setTransferToEmpId] = useState(users[1]?.id || '');
  const [transferReason, setTransferReason] = useState('');
  const [transferFeedback, setTransferFeedback] = useState<{ error?: string; success?: string }>({});

  // Return Modal
  const [returnAllocId, setReturnAllocId] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<AssetCondition>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const activeAllocations = allocations.filter((a) => a.status === 'Active' || a.status === 'Overdue');
  const pastAllocations = allocations.filter((a) => a.status === 'Returned');
  const pendingTransfers = transfers.filter((t) => t.status === 'Pending');

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAllocError('');
    setAllocSuccess('');

    const targetEmp = users.find((u) => u.id === allocEmployeeId);
    if (!targetEmp) return;

    const res = allocateAsset({
      assetId: allocAssetId,
      employeeId: allocEmployeeId,
      departmentId: targetEmp.departmentId,
      expectedReturnDate: allocExpectedReturn,
    });

    if (res.success) {
      setAllocSuccess(res.message);
      setTimeout(() => {
        setIsAllocateOpen(false);
        setAllocSuccess('');
      }, 1500);
    } else {
      setAllocError(res.message);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferFeedback({});

    const targetEmp = users.find((u) => u.id === transferToEmpId);
    if (!targetEmp) return;

    const res = requestTransfer({
      assetId: transferAssetId,
      toEmployeeId: transferToEmpId,
      toDepartmentId: targetEmp.departmentId,
      reason: transferReason.trim(),
    });

    if (res.success) {
      setTransferFeedback({ success: res.message });
      setTimeout(() => {
        setIsTransferOpen(false);
        setTransferFeedback({});
        setTransferReason('');
      }, 1500);
    } else {
      setTransferFeedback({ error: res.message });
    }
  };

  const handleConfirmReturn = () => {
    if (!returnAllocId) return;
    const res = returnAsset(returnAllocId, returnNotes.trim(), returnCondition);
    if (res.success) {
      setReturnAllocId(null);
      setReturnNotes('');
    }
  };

  const canApproveTransfers = currentUser.role !== 'Employee';

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Asset Allocation & Custody Transfers</span>
            {pendingTransfers.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                {pendingTransfers.length} Pending Transfer
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict single-custodian enforcement, conflict prevention, transfer authorization, and return check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            <span>Request Transfer</span>
          </button>

          <button
            onClick={() => setIsAllocateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Equipment</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Active Allocations ({activeAllocations.length})
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'transfers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Transfer Queue</span>
          {pendingTransfers.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingTransfers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Past Returns Archive ({pastAllocations.length})
        </button>
      </div>

      {/* Tab 1: Active Allocations */}
      {activeTab === 'active' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Asset Tag / Name</th>
                  <th className="py-3 px-4">Assigned Custodian</th>
                  <th className="py-3 px-4">Department & Desk</th>
                  <th className="py-3 px-4">Allocation Date</th>
                  <th className="py-3 px-4">Expected Return</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeAllocations.length > 0 ? (
                  activeAllocations.map((alloc) => {
                    const asset = assets.find((a) => a.id === alloc.assetId);
                    const emp = users.find((u) => u.id === alloc.employeeId);
                    const dept = departments.find((d) => d.id === alloc.departmentId);
                    const isOverdue = alloc.status === 'Overdue' || (alloc.status === 'Active' && alloc.expectedReturnDate < todayStr);

                    return (
                      <tr
                        key={alloc.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isOverdue ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {asset?.assetTag}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {asset?.name}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            SN: {asset?.serialNumber}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {emp?.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{emp?.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 dark:text-slate-200">{dept?.name}</div>
                          <div className="text-[11px] text-slate-400">{emp?.location}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {alloc.allocationDate}
                        </td>

                        <td className="py-3.5 px-4">
                          <div
                            className={`font-mono ${
                              isOverdue ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {alloc.expectedReturnDate}
                          </div>
                          {isOverdue && (
                            <span className="text-[10px] text-rose-500 font-semibold block">
                              OVERDUE RETURN
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge status={isOverdue ? 'Overdue' : 'Active'} size="sm" pulse={isOverdue} />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setReturnAllocId(alloc.id);
                              setReturnCondition(asset?.condition || 'Good');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Check-in Return</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No active allocations right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transfer Queue */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {!canApproveTransfers && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span>
                You are currently viewing as Employee. Only Asset Managers and Admins can approve or reject transfer requests. Use the role switcher in the top right to simulate manager authorization.
              </span>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">From Custodian</th>
                    <th className="py-3 px-4">To Recipient</th>
                    <th className="py-3 px-4">Transfer Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transfers.length > 0 ? (
                    transfers.map((trf) => {
                      const asset = assets.find((a) => a.id === trf.assetId);
                      const fromEmp = users.find((u) => u.id === trf.fromEmployeeId);
                      const toEmp = users.find((u) => u.id === trf.toEmployeeId);

                      return (
                        <tr key={trf.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {asset?.assetTag}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {asset?.name}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {fromEmp?.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{fromEmp?.departmentName}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {toEmp?.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{toEmp?.departmentName}</div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-slate-700 dark:text-slate-300 italic">
                              &ldquo;{trf.reason}&rdquo;
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              Requested {trf.createdAt ? new Date(trf.createdAt).toLocaleDateString() : 'Recently'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge status={trf.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {trf.status === 'Pending' ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  disabled={!canApproveTransfers}
                                  onClick={() => approveTransfer(trf.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  disabled={!canApproveTransfers}
                                  onClick={() => rejectTransfer(trf.id)}
                                  className="p-1 rounded-md text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No transfer requests logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Return Archive */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Previous Holder</th>
                  <th className="py-3 px-4">Allocation Period</th>
                  <th className="py-3 px-4">Returned Date</th>
                  <th className="py-3 px-4">Return Condition</th>
                  <th className="py-3 px-4">Check-in Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastAllocations.length > 0 ? (
                  pastAllocations.map((alloc) => {
                    const asset = assets.find((a) => a.id === alloc.assetId);
                    const emp = users.find((u) => u.id === alloc.employeeId);

                    return (
                      <tr key={alloc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {asset?.assetTag}
                          </span>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {asset?.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                          {emp?.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {alloc.allocationDate} → {alloc.expectedReturnDate}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200">
                          {alloc.returnedDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={alloc.returnCondition || 'Good'} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 italic">
                          {alloc.returnNotes || 'Routine return with no damages reported.'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No returned asset records in archive yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocate Equipment Modal */}
      <Modal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title="Allocate Asset to Employee"
        subtitle="Enforces strict duplicate conflict prevention"
        maxWidth="lg"
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          {allocError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{allocError}</span>
            </div>
          )}

          {allocSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{allocSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Asset *
            </label>
            <select
              value={allocAssetId}
              onChange={(e) => setAllocAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.assetTag}] {a.name} — Status: {a.status}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Attempting to allocate an already assigned equipment will trigger a conflict prevention warning.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assign to Employee *
            </label>
            <select
              value={allocEmployeeId}
              onChange={(e) => setAllocEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} - {u.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expected Return Date *
            </label>
            <input
              type="date"
              value={allocExpectedReturn}
              onChange={(e) => setAllocExpectedReturn(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAllocateOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Transfer Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Request Asset Transfer"
        subtitle="Initiate custody transfer to another team member"
        maxWidth="lg"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          {transferFeedback.error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {transferFeedback.error}
            </div>
          )}
          {transferFeedback.success && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {transferFeedback.success}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Allocated Asset *
            </label>
            <select
              value={transferAssetId}
              onChange={(e) => setTransferAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.assetTag}] {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transfer To Employee *
            </label>
            <select
              value={transferToEmpId}
              onChange={(e) => setTransferToEmpId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.departmentName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Justification / Reason *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Project handoff for Q4 Android build regression suite."
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              Submit Transfer Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-in Return Modal */}
      <Modal
        isOpen={!!returnAllocId}
        onClose={() => setReturnAllocId(null)}
        title="Check-in Equipment Return"
        subtitle="Inspect physical condition and release asset back to inventory"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Checked Condition Upon Return *
            </label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as AssetCondition)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Good">Good (Ready for re-allocation)</option>
              <option value="Brand New">Brand New</option>
              <option value="Fair">Fair (Minor cosmetic wear)</option>
              <option value="Needs Repair">Needs Repair (Automatically flags for maintenance)</option>
              <option value="Damaged">Damaged (Sends to maintenance bay)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Check-in Notes / Condition Report
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Device returned clean with power adapter and USB-C cable intact."
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setReturnAllocId(null)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReturn}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              Complete Check-in
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
