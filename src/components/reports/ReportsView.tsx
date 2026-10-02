import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Filter,
  PieChart,
  Layers,
  Clock,
  Wrench,
  CheckCircle,
  Building,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const ReportsView: React.FC = () => {
  const {
    assets,
    categories,
    departments,
    allocations,
    bookings,
    maintenanceRequests,
    seats,
    users,
  } = useApp();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredAssets = selectedDeptFilter === 'all'
    ? assets
    : assets.filter((a) => a.departmentId === selectedDeptFilter);

  // 1. Department Allocation Breakdown
  const deptStats = departments.map((d) => {
    const deptAssets = assets.filter((a) => a.departmentId === d.id);
    const allocated = deptAssets.filter((a) => a.status === 'Allocated').length;
    const available = deptAssets.filter((a) => a.status === 'Available').length;
    const maintenance = deptAssets.filter((a) => a.status === 'Under Maintenance').length;
    const totalCost = deptAssets.reduce((acc, curr) => acc + (curr.acquisitionCost || 0), 0);

    return {
      id: d.id,
      name: d.name,
      code: d.code,
      total: deptAssets.length,
      allocated,
      available,
      maintenance,
      utilization: deptAssets.length > 0 ? Math.round((allocated / deptAssets.length) * 100) : 0,
      totalCost,
    };
  });

  // 2. Category Maintenance Frequency
  const categoryMaintenanceStats = categories.map((cat) => {
    const catAssets = assets.filter((a) => a.categoryId === cat.id);
    const catAssetIds = new Set(catAssets.map((a) => a.id));
    const ticketCount = maintenanceRequests.filter((m) => catAssetIds.has(m.assetId)).length;

    return {
      id: cat.id,
      name: cat.name,
      assetCount: catAssets.length,
      ticketCount,
    };
  });

  // 3. Idle Assets
  const idleAssets = assets.filter((a) => a.status === 'Available' && !a.isBookable);

  // 4. Overdue / Due returns
  const todayStr = new Date().toISOString().split('T')[0];
  const activeAllocations = allocations.filter((a) => a.status === 'Active' || a.status === 'Overdue');
  const overdueAllocations = activeAllocations.filter((a) => a.status === 'Overdue' || a.expectedReturnDate < todayStr);

  // CSV Export Engine
  const handleExportCSV = () => {
    const headers = [
      'Asset Tag',
      'Name',
      'Category',
      'Serial Number',
      'Status',
      'Condition',
      'Department',
      'Location',
      'Acquisition Cost',
      'Acquisition Date',
      'Is Bookable',
    ];

    const rows = filteredAssets.map((a) => {
      const cat = categories.find((c) => c.id === a.categoryId)?.name || '';
      const dept = departments.find((d) => d.id === a.departmentId)?.name || '';
      return [
        `"${a.assetTag}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${a.serialNumber}"`,
        `"${a.status}"`,
        `"${a.condition}"`,
        `"${dept.replace(/"/g, '""')}"`,
        `"${a.location.replace(/"/g, '""')}"`,
        a.acquisitionCost || 0,
        a.acquisitionDate || '',
        a.isBookable ? 'Yes' : 'No',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AssetFlow_Inventory_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Operations & Asset Intelligence</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
              CSV Export Ready
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated lifecycle metrics, maintenance hot-spots, department utilization, and idle equipment audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Overall Inventory Utilization</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {assets.length > 0
              ? Math.round(
                  (assets.filter((a) => a.status === 'Allocated').length / assets.length) * 100
                )
              : 0}
            %
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {assets.filter((a) => a.status === 'Allocated').length} of {assets.length} assets actively in custody
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Capital Asset Valuation</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ${assets.reduce((acc, a) => acc + (a.acquisitionCost || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Acquisition cost logged for reporting purposes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Maintenance Incident Rate</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {maintenanceRequests.length} Tickets
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {maintenanceRequests.filter((m) => m.status === 'Resolved').length} resolved,{' '}
            {maintenanceRequests.filter((m) => m.status !== 'Resolved').length} currently active
          </div>
        </div>
      </div>

      {/* Department Utilization Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
          Department-Wise Allocation & Utilization
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Assets</th>
                <th className="py-3 px-4">Allocated</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">Under Maintenance</th>
                <th className="py-3 px-4">Utilization Rate</th>
                <th className="py-3 px-4 text-right">Acquisition Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deptStats.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {d.name} <span className="font-mono text-slate-400">({d.code})</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{d.total}</td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-semibold">{d.allocated}</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{d.available}</td>
                  <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">{d.maintenance}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${d.utilization}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{d.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                    ${d.totalCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Maintenance by Category & Idle Assets Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Frequency by Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Maintenance Frequency by Taxonomy Category
            </h3>
            <span className="text-xs text-slate-400">Reliability Index</span>
          </div>

          <div className="space-y-3">
            {categoryMaintenanceStats.map((c) => {
              const maxTickets = Math.max(...categoryMaintenanceStats.map((x) => x.ticketCount), 1);
              const barPercent = Math.round((c.ticketCount / maxTickets) * 100);

              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {c.ticketCount} tickets logged ({c.assetCount} assets in fleet)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.ticketCount > 1 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Idle Equipment Audit List */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Unassigned & Idle Equipment ({idleAssets.length})
            </h3>
            <span className="text-xs text-slate-400">Re-allocation Candidates</span>
          </div>

          {idleAssets.length > 0 ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {idleAssets.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {a.assetTag}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{a.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Located: {a.location} • Value: ${a.acquisitionCost.toLocaleString()}
                    </div>
                  </div>
                  <Badge status="Available" size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Zero idle equipment. All assets are actively deployed or scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
