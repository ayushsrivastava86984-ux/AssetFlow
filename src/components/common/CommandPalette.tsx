import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAssetHealth } from '../../utils/assetHealth';
import {
  Search,
  Boxes,
  Users,
  Building2,
  Calendar,
  Wrench,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X,
  Shield,
  Activity,
} from 'lucide-react';
import { Badge } from './Badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectAsset?: (assetId: string) => void;
  onOpenDemo?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectAsset,
  onOpenDemo,
}) => {
  const {
    assets,
    users,
    departments,
    bookings,
    maintenanceRequests,
    auditCycles,
    allocations,
  } = useApp();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'assets' | 'employees' | 'departments' | 'bookings' | 'maintenance' | 'audits'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Assets
  const matchingAssets = assets.filter((a) => {
    if (!q) return true;
    return (
      a.assetTag.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  // Search Employees
  const matchingEmployees = users.filter((u) => {
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.departmentName && u.departmentName.toLowerCase().includes(q))
    );
  }).slice(0, 5);

  // Search Departments
  const matchingDepartments = departments.filter((d) => {
    if (!q) return true;
    return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
  }).slice(0, 4);

  // Search Bookings
  const matchingBookings = bookings.filter((b) => {
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.purpose.toLowerCase().includes(q)
    );
  }).slice(0, 4);

  // Search Maintenance
  const matchingMaintenance = maintenanceRequests.filter((m) => {
    if (!q) return true;
    const a = assets.find((x) => x.id === m.assetId);
    return (
      m.issueDescription.toLowerCase().includes(q) ||
      (a && a.assetTag.toLowerCase().includes(q)) ||
      m.priority.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  }).slice(0, 4);

  // Search Audits
  const matchingAudits = auditCycles.filter((c) => {
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }).slice(0, 3);

  const handleAssetClick = (assetId: string) => {
    onClose();
    if (onSelectAsset) {
      onSelectAsset(assetId);
    } else {
      onNavigateTab('assets');
    }
  };

  const handleNav = (tab: string) => {
    onClose();
    onNavigateTab(tab);
  };

  const hasAnyResults =
    matchingAssets.length > 0 ||
    matchingEmployees.length > 0 ||
    matchingDepartments.length > 0 ||
    matchingBookings.length > 0 ||
    matchingMaintenance.length > 0 ||
    matchingAudits.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets (e.g. AF-0014), employees, departments, tickets..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-mono">
            <span>ESC</span>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'assets', label: `Assets (${matchingAssets.length})` },
            { id: 'employees', label: `Staff (${matchingEmployees.length})` },
            { id: 'departments', label: 'Departments' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'audits', label: 'Audits' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Demo Launch Bar */}
          {!q && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    23-Step Signature Demo Scenario
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Full automated ERP walkthrough: registration, conflict prevention, transfer, maintenance, and audit
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenDemo) onOpenDemo();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                Launch Demo
              </button>
            </div>
          )}

          {/* ASSETS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'assets') && matchingAssets.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-blue-500" /> Assets & Equipment
                </span>
                <span className="text-[10px] lowercase text-slate-400">press enter to inspect</span>
              </div>
              <div className="space-y-1">
                {matchingAssets.map((asset) => {
                  const health = calculateAssetHealth(asset, maintenanceRequests, []);
                  const currentAlloc = allocations.find((a) => a.assetId === asset.id && a.status === 'Active');
                  const holder = currentAlloc ? users.find((u) => u.id === currentAlloc.employeeId) : null;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetClick(asset.id)}
                      className="group p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {asset.assetTag}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {asset.name}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${health.badgeBg} ${health.badgeText} ${health.badgeBorder}`}>
                            Health: {health.level} ({health.score}%)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span>SN: <span className="font-mono">{asset.serialNumber}</span></span>
                          <span>•</span>
                          <span>Loc: {asset.location}</span>
                          <span>•</span>
                          <span>Cond: {asset.condition}</span>
                          {holder && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                Custodian: {holder.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge status={asset.status} size="sm" />
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPLOYEES SECTION */}
          {(activeCategory === 'all' || activeCategory === 'employees') && matchingEmployees.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" /> Employees & Staff
              </div>
              <div className="space-y-1">
                {matchingEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleNav('organization')}
                    className="group p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{emp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({emp.email})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {emp.role} • {emp.departmentName || 'General Staff'}
                      </div>
                    </div>
                    <Badge status={emp.role} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEPARTMENTS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'departments') && matchingDepartments.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Departments
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    onClick={() => handleNav('organization')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {dept.name} <span className="text-[10px] font-mono text-slate-400">({dept.code})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Head: {dept.headName || 'Unassigned'} • Status: {dept.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKINGS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'bookings') && matchingBookings.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> Resource Bookings
              </div>
              <div className="space-y-1">
                {matchingBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleNav('bookings')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Booked by {b.userName} • {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Badge status={b.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAINTENANCE SECTION */}
          {(activeCategory === 'all' || activeCategory === 'maintenance') && matchingMaintenance.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" /> Maintenance Tickets
              </div>
              <div className="space-y-1">
                {matchingMaintenance.map((m) => {
                  const asset = assets.find((a) => a.id === m.assetId);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleNav('maintenance')}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="font-mono text-amber-600 dark:text-amber-400">{asset?.assetTag}</span>
                          <span className="truncate">{m.issueDescription}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Priority: {m.priority} • Tech: {m.technicianName || 'Unassigned'}
                        </div>
                      </div>
                      <Badge status={m.status} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDITS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'audits') && matchingAudits.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-cyan-500" /> Audit Cycles
              </div>
              <div className="space-y-1">
                {matchingAudits.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleNav('audits')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Scope: {c.location} • Verified: {c.verifiedCount}/{c.totalAssetsCount}
                      </div>
                    </div>
                    <Badge status={c.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasAnyResults && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found across assets, staff, bookings, or tickets.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                <CornerDownLeft className="w-2.5 h-2.5 inline" />
              </kbd>{' '}
              Open
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            AssetFlow Command Hub
          </div>
        </div>
      </div>
    </div>
  );
};
