import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Seat, SeatStatus } from '../../types';
import {
  Armchair,
  Building,
  CheckCircle,
  AlertTriangle,
  Plus,
  User,
  Check,
  X,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const SeatAllocationView: React.FC = () => {
  const {
    buildings,
    floors,
    seats,
    users,
    departments,
    seatRequests,
    assignSeat,
    releaseSeat,
    requestSeat,
    reviewSeatRequest,
    currentUser,
  } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
  const [selectedFloorId, setSelectedFloorId] = useState<string>(floors[0]?.id || '');

  // Modals
  const [selectedSeatForAction, setSelectedSeatForAction] = useState<Seat | null>(null);
  const [assignEmpId, setAssignEmpId] = useState<string>(users[0]?.id || '');
  const [assignFeedback, setAssignFeedback] = useState<{ error?: string; success?: string }>({});

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [targetSeatNumber, setTargetSeatNumber] = useState('');

  const currentFloors = floors.filter((f) => f.buildingId === selectedBuildingId);
  const currentSeats = seats.filter((s) => s.floorId === selectedFloorId);

  // Statistics for this floor & global
  const totalFloorSeats = currentSeats.length;
  const availableFloorSeats = currentSeats.filter((s) => s.status === 'Available').length;
  const occupiedFloorSeats = currentSeats.filter((s) => s.status === 'Occupied').length;
  const reservedFloorSeats = currentSeats.filter((s) => s.status === 'Reserved').length;

  const pendingRequests = seatRequests.filter((r) => r.status === 'Pending');

  const handleAssignSeat = () => {
    if (!selectedSeatForAction) return;
    setAssignFeedback({});

    const res = assignSeat(selectedSeatForAction.id, assignEmpId);
    if (res.success) {
      setAssignFeedback({ success: res.message });
      setTimeout(() => {
        setSelectedSeatForAction(null);
        setAssignFeedback({});
      }, 1200);
    } else {
      setAssignFeedback({ error: res.message });
    }
  };

  const handleReleaseSeat = () => {
    if (!selectedSeatForAction) return;
    const res = releaseSeat(selectedSeatForAction.id);
    if (res.success) {
      setSelectedSeatForAction(null);
    }
  };

  const handleSeatRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestSeat(selectedFloorId, selectedSeatForAction?.id, requestReason);
    if (res.success) {
      setIsRequestModalOpen(false);
      setRequestReason('');
      setSelectedSeatForAction(null);
    }
  };

  const canManageSeating = currentUser.role === 'Admin' || currentUser.role === 'Asset Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Visual Workspace & Seat Allocation</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
              Interactive Grid
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time floor layout maps, desk reservations, single-seat conflict controls, and employee relocations.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Request Desk Allocation</span>
        </button>
      </div>

      {/* Building & Floor Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Building Facility
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => {
                setSelectedBuildingId(e.target.value);
                const firstFloor = floors.find((f) => f.buildingId === e.target.value);
                if (firstFloor) setSelectedFloorId(firstFloor.id);
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Floor Plan
            </label>
            <select
              value={selectedFloorId}
              onChange={(e) => setSelectedFloorId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {currentFloors.map((f) => (
                <option key={f.id} value={f.id}>
                  Floor {f.floorNumber} — {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Available ({availableFloorSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600"></span>
            <span>Occupied ({occupiedFloorSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500"></span>
            <span>Reserved ({reservedFloorSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-400"></span>
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {/* Interactive Seat Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Visual Seating Layout Grid
            </h3>
            <p className="text-xs text-slate-400">
              Click any desk pod to inspect occupant, assign team member, or trigger release
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {occupiedFloorSeats} of {totalFloorSeats} Desks Occupied (
            {Math.round((occupiedFloorSeats / (totalFloorSeats || 1)) * 100)}%)
          </span>
        </div>

        {currentSeats.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentSeats.map((seat) => {
              const occupant = users.find((u) => u.id === seat.assignedEmployeeId);

              const statusColor =
                seat.status === 'Available'
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500'
                  : seat.status === 'Occupied'
                  ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-500'
                  : seat.status === 'Reserved'
                  ? 'border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60';

              const indicatorBadge =
                seat.status === 'Available'
                  ? 'bg-emerald-500'
                  : seat.status === 'Occupied'
                  ? 'bg-blue-600'
                  : seat.status === 'Reserved'
                  ? 'bg-purple-500'
                  : 'bg-slate-400';

              return (
                <div
                  key={seat.id}
                  onClick={() => setSelectedSeatForAction(seat)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs group ${statusColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${indicatorBadge}`}></span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {seat.seatNumber}
                      </span>
                    </div>
                    <Badge status={seat.status} size="sm" />
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {seat.zone}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    {occupant ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {occupant.name[0]}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {occupant.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {occupant.departmentName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Open for Allocation
                      </span>
                    )}
                  </div>

                  {seat.amenities && seat.amenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {seat.amenities.map((a, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No desk workstations mapped for this floor level yet.
          </div>
        )}
      </div>

      {/* Pending Seat Requests Queue (Admin & Facility Review) */}
      {pendingRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              Desk Relocation & Assignment Requests ({pendingRequests.length})
            </h3>
            {!canManageSeating && (
              <span className="text-[11px] text-slate-400">
                (Approvals restricted to Admin / Facilities)
              </span>
            )}
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const requester = users.find((u) => u.id === req.employeeId);
              const targetSeat = seats.find((s) => s.id === req.seatId);

              return (
                <div
                  key={req.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {requester?.name} ({requester?.departmentName})
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                      Requested: {targetSeat ? `Seat ${targetSeat.seatNumber}` : 'Any open desk in zone'} • &ldquo;{req.reason}&rdquo;
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Logged {new Date(req.requestedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5">
                    <button
                      disabled={!canManageSeating}
                      onClick={() => reviewSeatRequest(req.id, true)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                    >
                      Approve & Assign
                    </button>
                    <button
                      disabled={!canManageSeating}
                      onClick={() => reviewSeatRequest(req.id, false)}
                      className="p-1 rounded-md text-xs font-semibold border border-slate-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seat Detail & Action Modal */}
      {selectedSeatForAction && (
        <Modal
          isOpen={!!selectedSeatForAction}
          onClose={() => {
            setSelectedSeatForAction(null);
            setAssignFeedback({});
          }}
          title={`Desk Pod: ${selectedSeatForAction.seatNumber}`}
          subtitle={`${selectedSeatForAction.zone} • Status: ${selectedSeatForAction.status}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {assignFeedback.error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {assignFeedback.error}
              </div>
            )}
            {assignFeedback.success && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                {assignFeedback.success}
              </div>
            )}

            {/* Current occupant details */}
            {selectedSeatForAction.assignedEmployeeId ? (
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60">
                <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                  Current Assigned Occupant
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {users.find((u) => u.id === selectedSeatForAction.assignedEmployeeId)?.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {users.find((u) => u.id === selectedSeatForAction.assignedEmployeeId)?.email}
                </div>

                {canManageSeating && (
                  <button
                    onClick={handleReleaseSeat}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Release / Vacate Desk</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200">
                  This desk is currently free. You can assign it to any employee directly.
                </div>

                {canManageSeating ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assign To Employee *
                    </label>
                    <select
                      value={assignEmpId}
                      onChange={(e) => setAssignEmpId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.departmentName} ({u.role})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleAssignSeat}
                      className="mt-3 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Confirm Desk Assignment
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsRequestModalOpen(true);
                      setTargetSeatNumber(selectedSeatForAction.seatNumber);
                    }}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Request this Desk
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Desk Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Submit Desk Allocation Request"
        subtitle="Request a workstation pod from the facilities operations team"
        maxWidth="md"
      >
        <form onSubmit={handleSeatRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Desk Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. B2-E02"
              value={targetSeatNumber}
              onChange={(e) => setTargetSeatNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Justification / Equipment Needs *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Relocating to collaborate with the Core Platform API team for Q4 release."
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
