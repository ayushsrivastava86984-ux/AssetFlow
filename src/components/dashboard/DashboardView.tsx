import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Calendar,
  ArrowRightLeft,
  CalendarClock,
  Clock,
  Users,
  Building,
  Armchair,
  PlusCircle,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  PieChart,
  Layers,
} from 'lucide-react';
import { NeedsAttentionSection } from './NeedsAttentionSection';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenAssetRegister: () => void;
  onOpenAllocateModal: () => void;
  onOpenBookingModal: () => void;
  onOpenDemo?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAssetRegister,
  onOpenAllocateModal,
  onOpenBookingModal,
  onOpenDemo,
}) => {
  const {
    currentUser,
    kpis,
    assets,
    allocations,
    bookings,
    maintenanceRequests,
    activityLogs,
    users,
    departments,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Real calculations
  const overdueAllocations = allocations.filter((a) => {
    if (a.status === 'Overdue') return true;
    if (a.status === 'Active' && a.expectedReturnDate < todayStr) return true;
    return false;
  });

  const upcomingBookingsList = bookings
    .filter((b) => b.status === 'Upcoming' || b.status === 'Ongoing')
    .slice(0, 4);

  const activeMaintenanceList = maintenanceRequests
    .filter((m) => m.status === 'In Progress' || m.status === 'Pending')
    .slice(0, 4);

  // Status distribution
  const statusCounts: Record<string, number> = {
    Available: assets.filter((a) => a.status === 'Available').length,
    Allocated: assets.filter((a) => a.status === 'Allocated').length,
    'Under Maintenance': assets.filter((a) => a.status === 'Under Maintenance').length,
    Reserved: assets.filter((a) => a.status === 'Reserved').length,
    Lost: assets.filter((a) => a.status === 'Lost').length,
  };

  // Department distribution
  const deptCounts = departments.map((d) => ({
    name: d.name,
    code: d.code,
    count: assets.filter((a) => a.departmentId === d.id).length,
  }));

  return (
    <div className="space-y-6">
      {/* Role-aware Welcome Banner with Demo Trigger */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white border border-slate-700/60 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {currentUser.role} View
              </span>
              <span className="text-xs text-slate-300">
                • {currentUser.departmentName}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Live enterprise resource intelligence. Track lifecycle statuses, eliminate duplicate allocations, and prevent resource booking collisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenDemo && (
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>23-Step Signature Demo</span>
              </button>
            )}
            <button
              onClick={onOpenAssetRegister}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Asset</span>
            </button>
            <button
              onClick={onOpenAllocateModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Allocate Equipment</span>
            </button>
            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Resource</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* Smart Dashboard: Needs Attention Section (Section 4.E Requirement) */}
      <NeedsAttentionSection onNavigate={onNavigate} />

      {/* Overdue Return Banner (Prompt requirement: displayed separately from upcoming returns) */}
      {overdueAllocations.length > 0 && (
        <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500 text-white shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Attention Required: {overdueAllocations.length} Overdue Asset Allocation(s)
                </h3>
                <button
                  onClick={() => onNavigate('allocations')}
                  className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1"
                >
                  Manage Returns <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                The following equipment has surpassed its scheduled return date without check-in:
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {overdueAllocations.map((alloc) => {
                  const asset = assets.find((a) => a.id === alloc.assetId);
                  const holder = users.find((u) => u.id === alloc.employeeId);
                  return (
                    <div
                      key={alloc.id}
                      className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                            {asset?.assetTag}
                          </span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
                            {asset?.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Holder: {holder?.name} • Due: {alloc.expectedReturnDate}
                        </div>
                      </div>
                      <Badge status="Overdue" size="sm" pulse />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Grid (Real Database Records) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core Operational Metrics
          </h2>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Live Database Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Total Assets */}
          <div
            onClick={() => onNavigate('assets')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Assets
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {kpis.totalAssets}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{kpis.idleAssetsCount} Unassigned / Idle</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
            </div>
          </div>

          {/* Assets Available */}
          <div
            onClick={() => onNavigate('assets')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Assets Available
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 text-emerald-600 dark:text-emerald-400">
              {kpis.assetsAvailable}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Ready for immediate allocation
            </div>
          </div>

          {/* Assets Allocated */}
          <div
            onClick={() => onNavigate('allocations')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Assets Allocated
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {kpis.assetsAllocated}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active custodian custody
            </div>
          </div>

          {/* Under Maintenance */}
          <div
            onClick={() => onNavigate('maintenance')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Under Maintenance
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 text-amber-600 dark:text-amber-400">
              {kpis.maintenanceCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Locked from booking & allocation
            </div>
          </div>

          {/* Active Bookings */}
          <div
            onClick={() => onNavigate('bookings')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Bookings
              </span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {kpis.activeBookings}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Collision-protected schedules
            </div>
          </div>

          {/* Pending Transfers */}
          <div
            onClick={() => onNavigate('allocations')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pending Transfers
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {kpis.pendingTransfers}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Awaiting manager sign-off
            </div>
          </div>

          {/* Upcoming Returns */}
          <div
            onClick={() => onNavigate('allocations')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Upcoming Returns
              </span>
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {kpis.upcomingReturns}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              On-schedule check-ins
            </div>
          </div>

          {/* Overdue Returns (Separated) */}
          <div
            onClick={() => onNavigate('allocations')}
            className={`p-4 rounded-xl border transition-all shadow-xs cursor-pointer group ${
              kpis.overdueReturns > 0
                ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">
                Overdue Returns
              </span>
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
              {kpis.overdueReturns}
            </div>
            <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
              Action required immediately
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Resources & Space Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              {kpis.totalEmployees}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Employees Enrolled</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              {kpis.totalDepartments}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Departments</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Armchair className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              {kpis.occupiedSeats} / {kpis.totalSeats}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Occupied Seats ({Math.round((kpis.occupiedSeats / (kpis.totalSeats || 1)) * 100)}%)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              {kpis.pendingSeatRequests}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Seat Requests Pending</div>
          </div>
        </div>
      </div>

      {/* Asset Distribution & Department Allocation (Section 8 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Lifecycle Status Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Asset Distribution by Status
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {assets.length} Total Registered
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Available', count: statusCounts['Available'] || 0, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Allocated', count: statusCounts['Allocated'] || 0, color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
              { label: 'Under Maintenance', count: statusCounts['Under Maintenance'] || 0, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
              { label: 'Reserved', count: statusCounts['Reserved'] || 0, color: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
              { label: 'Lost / Decommissioned', count: statusCounts['Lost'] || 0, color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
            ].map((item) => {
              const pct = assets.length > 0 ? Math.round((item.count / assets.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className={`font-mono font-semibold ${item.text}`}>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Allocation Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Equipment Allocation by Department
              </h3>
            </div>
            <button
              onClick={() => onNavigate('organization')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Org Directory
            </button>
          </div>

          <div className="space-y-3">
            {deptCounts.map((dept) => {
              const pct = assets.length > 0 ? Math.round((dept.count / assets.length) * 100) : 0;
              return (
                <div key={dept.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {dept.name} <span className="font-mono text-slate-400 text-[11px]">({dept.code})</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {dept.count} Assets ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Operations Queues & Real Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Bookings & Maintenance */}
        <div className="space-y-6">
          {/* Active Bookings Queue */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Active & Upcoming Resource Bookings
                </h3>
              </div>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View Calendar
              </button>
            </div>

            {upcomingBookingsList.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingBookingsList.map((b) => {
                  const resource = assets.find((a) => a.id === b.resourceId);
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {b.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {resource?.name} • Booked by {b.userName}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                          {new Date(b.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                          ({new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </div>
                      </div>
                      <Badge status={b.status} size="sm" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No active bookings. Shared rooms and projectors are ready to reserve.
              </div>
            )}
          </div>

          {/* Maintenance Center Queue */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Maintenance Work Orders
                </h3>
              </div>
              <button
                onClick={() => onNavigate('maintenance')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Work Order Bay
              </button>
            </div>

            {activeMaintenanceList.length > 0 ? (
              <div className="space-y-2.5">
                {activeMaintenanceList.map((m) => {
                  const asset = assets.find((a) => a.id === m.assetId);
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                            {asset?.assetTag}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {asset?.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {m.issueDescription}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Priority: {m.priority} • Tech: {m.technicianName || 'Unassigned'}
                        </div>
                      </div>
                      <Badge status={m.status} size="sm" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                All systems healthy. No open maintenance tickets.
              </div>
            )}
          </div>
        </div>

        {/* Right: Real Activity Logs Stream */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Audit & Operations Log
            </h3>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Full Audit Trail
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {activityLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {log.userName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {log.userRole}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
