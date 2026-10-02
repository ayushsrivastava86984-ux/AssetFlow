import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus, AssetCondition } from '../../types';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  ArrowRightLeft,
  Wrench,
  Clock,
  Eye,
  CheckCircle,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { QRCodeModal } from '../common/QRCodeModal';
import { AssetProfileDrawer } from './AssetProfileDrawer';
import { calculateAssetHealth } from '../../utils/assetHealth';

interface AssetDirectoryViewProps {
  onOpenAllocate: (assetId: string) => void;
  onOpenTransfer: (assetId: string) => void;
  onOpenMaintenance: (assetId: string) => void;
}

export const AssetDirectoryView: React.FC<AssetDirectoryViewProps> = ({
  onOpenAllocate,
  onOpenTransfer,
  onOpenMaintenance,
}) => {
  const {
    assets,
    categories,
    departments,
    allocations,
    maintenanceRequests,
    users,
    addAsset,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [bookableOnly, setBookableOnly] = useState(false);

  // Modals & drawers
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New asset form state
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || '');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [newAcquisitionDate, setNewAcquisitionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newAcquisitionCost, setNewAcquisitionCost] = useState('1200');
  const [newCondition, setNewCondition] = useState<AssetCondition>('Brand New');
  const [newDepartmentId, setNewDepartmentId] = useState(departments[0]?.id || '');
  const [newLocation, setNewLocation] = useState('');
  const [newIsBookable, setNewIsBookable] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTag = asset.assetTag.toLowerCase().includes(q);
      const matchName = asset.name.toLowerCase().includes(q);
      const matchSn = asset.serialNumber.toLowerCase().includes(q);
      const matchLoc = asset.location.toLowerCase().includes(q);
      if (!matchTag && !matchName && !matchSn && !matchLoc) return false;
    }

    if (selectedCategory !== 'all' && asset.categoryId !== selectedCategory) return false;
    if (selectedDepartment !== 'all' && asset.departmentId !== selectedDepartment) return false;
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
    if (bookableOnly && !asset.isBookable) return false;

    return true;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim() || !newSerialNumber.trim() || !newLocation.trim()) {
      setFormError('Please fill in Asset Name, Serial Number, and Physical Location.');
      return;
    }

    // Check duplicate serial
    if (assets.some((a) => a.serialNumber.toLowerCase() === newSerialNumber.trim().toLowerCase())) {
      setFormError('Conflict: An asset with this Serial Number already exists in the system.');
      return;
    }

    const res = addAsset({
      name: newName.trim(),
      categoryId: newCategoryId,
      serialNumber: newSerialNumber.trim(),
      acquisitionDate: newAcquisitionDate,
      acquisitionCost: parseFloat(newAcquisitionCost) || 0,
      condition: newCondition,
      departmentId: newDepartmentId,
      location: newLocation.trim(),
      photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
      isBookable: newIsBookable,
      status: 'Available',
      notes: newNotes.trim(),
    });

    if (res.success) {
      setIsRegisterOpen(false);
      // Reset form
      setNewName('');
      setNewSerialNumber('');
      setNewLocation('');
      setNewNotes('');
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Title and Registration Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Asset Inventory Directory</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredAssets.length} of {assets.length} Assets
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-assigned asset tags, lifecycle statuses, QR labels, and complete custodian histories.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tag (AF-0001), name, serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Bookable switch */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={bookableOnly}
              onChange={(e) => setBookableOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
            />
            <span className="font-medium">Only show shared bookable resources (e.g. Projectors, Labs, Vehicles)</span>
          </label>

          {(search || selectedCategory !== 'all' || selectedDepartment !== 'all' || selectedStatus !== 'all' || bookableOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedDepartment('all');
                setSelectedStatus('all');
                setBookableOnly(false);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Asset Table / Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Asset Tag / Name</th>
                <th className="py-3 px-4">Category & Serial</th>
                <th className="py-3 px-4">Department & Location</th>
                <th className="py-3 px-4">Health Index</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Current Holder</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const cat = categories.find((c) => c.id === asset.categoryId);
                  const dept = departments.find((d) => d.id === asset.departmentId);
                  const activeAlloc = allocations.find(
                    (a) => a.assetId === asset.id && (a.status === 'Active' || a.status === 'Overdue')
                  );
                  const holder = activeAlloc ? users.find((u) => u.id === activeAlloc.employeeId) : null;
                  const health = calculateAssetHealth(asset, maintenanceRequests, []);

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetForQR(asset);
                            }}
                            title="Generate & Print QR Code"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                {asset.assetTag}
                              </span>
                              {asset.isBookable && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  Bookable
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        <div className="text-slate-900 dark:text-slate-200 font-medium">
                          {cat?.name || 'Uncategorized'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          SN: {asset.serialNumber}
                        </div>
                      </td>

                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        <div className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {dept?.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{asset.location}</span>
                        </div>
                      </td>

                      {/* Asset Health Score (Section 4.B Requirement) */}
                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${health.badgeBg} ${health.badgeText} ${health.badgeBorder}`}
                        >
                          <span>{health.level}</span>
                          <span className="text-[10px] opacity-70">({health.score}%)</span>
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        <Badge status={asset.condition} size="sm" />
                      </td>

                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        <Badge status={asset.status} size="sm" />
                      </td>

                      <td
                        className="py-3.5 px-4"
                        onClick={() => setSelectedAssetForDetail(asset)}
                      >
                        {holder ? (
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {holder.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Due: {activeAlloc?.expectedReturnDate}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAssetForDetail(asset)}
                            title="View Enterprise Asset Profile & Timeline"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {asset.status === 'Available' && (
                            <button
                              onClick={() => onOpenAllocate(asset.id)}
                              title="Allocate Equipment"
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                            >
                              Allocate
                            </button>
                          )}

                          {asset.status === 'Allocated' && (
                            <button
                              onClick={() => onOpenTransfer(asset.id)}
                              title="Request Transfer"
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                            >
                              Transfer
                            </button>
                          )}

                          <button
                            onClick={() => onOpenMaintenance(asset.id)}
                            title="Report Maintenance Issue"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No equipment found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        asset={selectedAssetForQR}
        isOpen={!!selectedAssetForQR}
        onClose={() => setSelectedAssetForQR(null)}
      />

      {/* Enterprise Asset Profile & Relationship Drawer (Section 4.G Requirement) */}
      <AssetProfileDrawer
        asset={selectedAssetForDetail}
        isOpen={!!selectedAssetForDetail}
        onClose={() => setSelectedAssetForDetail(null)}
        onOpenAllocate={onOpenAllocate}
        onOpenTransfer={onOpenTransfer}
        onOpenMaintenance={onOpenMaintenance}
        onOpenQR={(asset) => setSelectedAssetForQR(asset)}
      />

      {/* Asset Registration Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Physical Asset"
        subtitle="Generates unique AF-XXXX asset tag and adds to central database"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-900">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro 16 M3 Max"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                placeholder="e.g. C02G90LKMD6R"
                value={newSerialNumber}
                onChange={(e) => setNewSerialNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Building B, Floor 2, Room 204"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Owner *
              </label>
              <select
                value={newDepartmentId}
                onChange={(e) => setNewDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Condition *
              </label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Brand New">Brand New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Acquisition Cost (USD, for reporting)
              </label>
              <input
                type="number"
                value={newAcquisitionCost}
                onChange={(e) => setNewAcquisitionCost(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Acquisition Date
              </label>
              <input
                type="date"
                value={newAcquisitionDate}
                onChange={(e) => setNewAcquisitionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900 dark:text-white">
              <input
                type="checkbox"
                checked={newIsBookable}
                onChange={(e) => setNewIsBookable(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Enable Shared Booking (Can be reserved in calendar)</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6">
              Check this if the asset is a meeting room, conference projector, lab equipment, or company vehicle.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Notes / Warranty Info
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 3-year enterprise AppleCare+, includes dual thunderbolt dock"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Register Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
