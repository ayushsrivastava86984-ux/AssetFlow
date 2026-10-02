import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenancePriority, MaintenanceStatus } from '../../types';
import {
  Wrench,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  UserCheck,
  Check,
  X,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface MaintenanceViewProps {
  initialAssetId?: string;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ initialAssetId }) => {
  const {
    assets,
    maintenanceRequests,
    submitMaintenanceRequest,
    updateMaintenanceStatus,
    currentUser,
  } = useApp();

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId || assets[0]?.id || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [submitFeedback, setSubmitFeedback] = useState<{ error?: string; success?: string }>({});

  // Technician assignment modal
  const [selectedTicketForUpdate, setSelectedTicketForUpdate] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<MaintenanceStatus>('In Progress');
  const [technicianName, setTechnicianName] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const isManagerOrAdmin = currentUser.role === 'Admin' || currentUser.role === 'Asset Manager';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFeedback({});

    const res = submitMaintenanceRequest({
      assetId: selectedAssetId,
      description: description.trim(),
      priority,
    });

    if (res.success) {
      setSubmitFeedback({ success: res.message });
      setTimeout(() => {
        setIsSubmitOpen(false);
        setSubmitFeedback({});
        setDescription('');
      }, 1500);
    } else {
      setSubmitFeedback({ error: res.message });
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedTicketForUpdate) return;
    updateMaintenanceStatus(selectedTicketForUpdate, newStatus, technicianName.trim(), resolutionNotes.trim());
    setSelectedTicketForUpdate(null);
    setTechnicianName('');
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Maintenance & Work Order Center</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
              Auto-Lock Safety Engaged
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log technical breakdowns, assign authorized technicians, and automatically prevent damaged assets from being checked out.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Role permission info banner */}
      {!isManagerOrAdmin && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-800 dark:text-blue-200 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            You are logged in as an Employee. You can report equipment incidents. Ticket approval, technician assignment, and final resolution sign-off require Asset Manager or Admin privileges.
          </span>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Asset Tag / Name</th>
                <th className="py-3 px-4">Reported Issue</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Reported By & Date</th>
                <th className="py-3 px-4">Assigned Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {maintenanceRequests.length > 0 ? (
                maintenanceRequests.map((ticket) => {
                  const asset = assets.find((a) => a.id === ticket.assetId);

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {asset?.assetTag}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{asset?.location}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {ticket.issueDescription}
                        </div>
                        {ticket.resolutionNotes && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 italic">
                            Resolution: {ticket.resolutionNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={ticket.priority} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {ticket.reportedByName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ticket.reportedAt ? new Date(ticket.reportedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {ticket.technicianName ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span>{ticket.technicianName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={ticket.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {ticket.status !== 'Resolved' ? (
                          <button
                            disabled={!isManagerOrAdmin}
                            onClick={() => {
                              setSelectedTicketForUpdate(ticket.id);
                              setNewStatus(ticket.status === 'Pending' ? 'Approved' : 'Resolved');
                              setTechnicianName(ticket.technicianName || '');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Update Work Order</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No active maintenance tickets logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Maintenance Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Report Equipment Maintenance Incident"
        subtitle="Immediately alerts asset managers and prevents duplicate allocation"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitFeedback.error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {submitFeedback.error}
            </div>
          )}

          {submitFeedback.success && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {submitFeedback.success}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Impacted Asset *
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.assetTag}] {a.name} — Status: {a.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Severity / Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Low">Low (Cosmetic, scheduled maintenance)</option>
              <option value="Medium">Medium (Partial malfunction, workaround available)</option>
              <option value="High">High (Device unusable, operational blocker)</option>
              <option value="Critical">Critical (Immediate safety or infrastructure hazard)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Breakdown Description *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. HDMI port has bent pins, causing screen flicker. Smelled minor overheating during presentation."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Work Order Modal */}
      <Modal
        isOpen={!!selectedTicketForUpdate}
        onClose={() => setSelectedTicketForUpdate(null)}
        title="Update Work Order & Assign Technician"
        subtitle="Manage maintenance lifecycle and update asset health"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workflow Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as MaintenanceStatus)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Approved">Approved (Queued for service)</option>
              <option value="In Progress">In Progress (Asset Locked)</option>
              <option value="Resolved">Resolved (Restores Asset to Available)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Certified Technician / Vendor
            </label>
            <input
              type="text"
              placeholder="e.g. Robert Vance (Certified AV Solutions)"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resolution Notes / Diagnostics
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Replaced faulty HDMI controller IC. Stress tested 4K 60Hz signal for 2 hours with zero drops."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedTicketForUpdate(null)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Save Work Order
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
