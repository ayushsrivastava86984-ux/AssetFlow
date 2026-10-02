import React, { useState } from 'react';
import { Asset, Allocation, MaintenanceRequest, AuditItem, ActivityLog, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateAssetHealth, buildAssetTimeline } from '../../utils/assetHealth';
import {
  X,
  QrCode,
  ArrowRightLeft,
  Wrench,
  RotateCcw,
  Calendar,
  ClipboardCheck,
  History,
  Info,
  MapPin,
  Building2,
  DollarSign,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface AssetProfileDrawerProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAllocate: (assetId: string) => void;
  onOpenTransfer: (assetId: string) => void;
  onOpenMaintenance: (assetId: string) => void;
  onOpenReturn?: (assetId: string) => void;
  onOpenQR: (asset: Asset) => void;
}

export const AssetProfileDrawer: React.FC<AssetProfileDrawerProps> = ({
  asset,
  isOpen,
  onClose,
  onOpenAllocate,
  onOpenTransfer,
  onOpenMaintenance,
  onOpenReturn,
  onOpenQR,
}) => {
  const {
    currentUser,
    categories,
    departments,
    allocations,
    maintenanceRequests,
    auditItems,
    activityLogs,
    bookings,
    users,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'allocations' | 'maintenance' | 'audits' | 'bookings'>('overview');

  if (!isOpen || !asset) return null;

  const category = categories.find((c) => c.id === asset.categoryId);
  const department = departments.find((d) => d.id === asset.departmentId);
  const activeAlloc = allocations.find((a) => a.assetId === asset.id && a.status === 'Active');
  const currentHolder = activeAlloc ? users.find((u) => u.id === activeAlloc.employeeId) : null;

  const health = calculateAssetHealth(asset, maintenanceRequests, auditItems);
  const timelineEvents = buildAssetTimeline(asset, allocations, maintenanceRequests, auditItems, activityLogs);

  const assetAllocations = allocations.filter((a) => a.assetId === asset.id);
  const assetMaintenance = maintenanceRequests.filter((m) => m.assetId === asset.id);
  const assetAudits = auditItems.filter((item) => item.assetId === asset.id);
  const assetBookings = bookings.filter((b) => b.resourceId === asset.id);

  const canAllocate = (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && asset.status === 'Available';
  const canTransfer = (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager' || currentUser.role === 'Department Head') && asset.status === 'Allocated';
  const canReturn = asset.status === 'Allocated';
  const canMaintain = asset.status !== 'Under Maintenance';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {asset.assetTag}
              </span>
              <Badge status={asset.status} size="sm" pulse={asset.status === 'Under Maintenance'} />
              <div
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${health.badgeBg} ${health.badgeText} ${health.badgeBorder}`}
                title={`Health Score: ${health.score}% based on condition, maintenance events, and age`}
              >
                <span>Health: {health.level}</span>
                <span className="text-[10px] opacity-75">({health.score}%)</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">
              {asset.name}
            </h2>

            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{category?.name || 'Equipment'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {asset.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {department?.name || 'Organization'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenQR(asset)}
              title="View Printable QR / Barcode"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Context Action Bar */}
        <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          {canAllocate && (
            <button
              onClick={() => {
                onClose();
                onOpenAllocate(asset.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Allocate Custody</span>
            </button>
          )}

          {canTransfer && (
            <button
              onClick={() => {
                onClose();
                onOpenTransfer(asset.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Request Transfer</span>
            </button>
          )}

          {canReturn && (
            <button
              onClick={() => {
                onClose();
                if (onOpenReturn) {
                  onOpenReturn(asset.id);
                } else {
                  onOpenTransfer(asset.id);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Check-In / Return</span>
            </button>
          )}

          {canMaintain && (
            <button
              onClick={() => {
                onClose();
                onOpenMaintenance(asset.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Log Maintenance</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Chronological Timeline ({timelineEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'allocations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Allocations ({assetAllocations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'maintenance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service Bay ({assetMaintenance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'audits'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Audits ({assetAudits.length})</span>
          </button>

          {asset.isBookable && (
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'bookings'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Bookings ({assetBookings.length})</span>
            </button>
          )}
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Custody Hero Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Custodian / Holder
                  </div>
                  {currentHolder ? (
                    <div className="mt-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{currentHolder.name}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">
                          ({currentHolder.departmentName})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Due: {activeAlloc?.expectedReturnDate}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      In Central Inventory (Unallocated)
                    </div>
                  )}
                </div>
                <Badge status={currentHolder ? 'Allocated' : 'Available'} size="sm" />
              </div>

              {/* Health Score Breakdown Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Asset Health Analysis
                    </h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${health.badgeBg} ${health.badgeText} ${health.badgeBorder}`}>
                    {health.level} Health Index ({health.score}/100)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {health.factors.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-2"
                    >
                      {f.status === 'good' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : f.status === 'fair' ? (
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{f.label}:</span>{' '}
                        <span className="text-slate-500 dark:text-slate-400">{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications & Parameters */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hardware Specifications & Inventory Details
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Serial Number:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {asset.serialNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Physical Condition:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {asset.condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Acquisition Date:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {asset.acquisitionDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Acquisition Cost (Info):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono">
                      ${asset.acquisitionCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Shared Booking Status:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {asset.isBookable ? 'Shared Resource (Bookable)' : 'Individual Custody Asset'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Operational Location:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {asset.location}
                    </span>
                  </div>
                </div>

                {asset.specs && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(asset.specs).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-400">{k}:</span>{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {asset.notes && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 italic">
                    &ldquo;{asset.notes}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHRONOLOGICAL TIMELINE (SIGNATURE UI REQUIREMENT) */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lifecycle Audit Trail & Chronology
                </h3>
                <span className="text-[11px] text-slate-400">
                  From initial registration to current status
                </span>
              </div>

              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 space-y-6 my-2">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative pl-6">
                    {/* Node Dot */}
                    <span className="absolute -left-2 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600"></span>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {evt.title}
                          </span>
                          {evt.statusBadge && <Badge status={evt.statusBadge} size="sm" />}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {evt.date}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300">
                        {evt.description}
                      </p>

                      {evt.actor && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          Authorized by: <span className="font-medium text-slate-600 dark:text-slate-300">{evt.actor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALLOCATIONS */}
          {activeTab === 'allocations' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Allocation & Custody History
              </h3>
              {assetAllocations.length > 0 ? (
                <div className="space-y-2">
                  {assetAllocations.map((alloc) => {
                    const emp = users.find((u) => u.id === alloc.employeeId);
                    return (
                      <div
                        key={alloc.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {emp?.name} ({emp?.departmentName || 'Employee'})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Assigned: {alloc.allocationDate} • Due: {alloc.expectedReturnDate}
                            {alloc.returnedDate && ` • Returned: ${alloc.returnedDate}`}
                          </div>
                          {alloc.returnNotes && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                              Notes: {alloc.returnNotes}
                            </div>
                          )}
                        </div>
                        <Badge status={alloc.status} size="sm" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  No allocations on record.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Maintenance Work Orders & Repairs
              </h3>
              {assetMaintenance.length > 0 ? (
                <div className="space-y-2">
                  {assetMaintenance.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {m.issueDescription}
                        </span>
                        <Badge status={m.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Priority: {m.priority} • Reported by: {m.reportedByName || 'Staff'} • Tech: {m.technicianName || 'Pending'}
                      </div>
                      {m.resolutionNotes && (
                        <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                          Resolution: {m.resolutionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  Zero maintenance tickets recorded. Asset is in healthy operating condition.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDITS */}
          {activeTab === 'audits' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audit Inspections & Reconciliation
              </h3>
              {assetAudits.length > 0 ? (
                <div className="space-y-2">
                  {assetAudits.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Verified Status: {item.status}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Audited: {item.verifiedAt || 'Recent Cycle'} • Auditor: {item.verifiedBy || 'Internal Auditor'}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            Inspection Notes: {item.notes}
                          </div>
                        )}
                      </div>
                      <Badge status={item.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  No audit discrepancies logged for this asset.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resource Reservation History
              </h3>
              {assetBookings.length > 0 ? (
                <div className="space-y-2">
                  {assetBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {b.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Booked by {b.userName} • {b.purpose}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                          {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} -{' '}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge status={b.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  No bookings scheduled for this shared resource.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
