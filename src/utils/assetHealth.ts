import { Asset, Allocation, MaintenanceRequest, AuditItem, ActivityLog } from '../types';

export type HealthScoreLevel = 'Excellent' | 'Good' | 'Attention' | 'Critical';

export interface AssetHealthResult {
  score: number;
  level: HealthScoreLevel;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  factors: {
    label: string;
    status: 'good' | 'fair' | 'poor';
    desc: string;
  }[];
}

/**
 * Calculates a practical, non-financial operational health score for an asset
 * based on physical condition, service history frequency, age, audit results, and current operational status.
 */
export function calculateAssetHealth(
  asset: Asset,
  maintenanceList: MaintenanceRequest[] = [],
  auditItems: AuditItem[] = []
): AssetHealthResult {
  const assetMaintenance = maintenanceList.filter((m) => m.assetId === asset.id);
  const assetAuditItems = auditItems.filter((item) => item.assetId === asset.id);

  let score = 0;
  const factors: AssetHealthResult['factors'] = [];

  // 1. Physical Condition Factor (Max 35 pts)
  const cond = (asset.condition || '').toLowerCase();
  if (cond.includes('new') || cond.includes('brand')) {
    score += 35;
    factors.push({ label: 'Condition', status: 'good', desc: 'Pristine / Like-New Condition' });
  } else if (cond.includes('good')) {
    score += 30;
    factors.push({ label: 'Condition', status: 'good', desc: 'Good Working Condition' });
  } else if (cond.includes('fair')) {
    score += 20;
    factors.push({ label: 'Condition', status: 'fair', desc: 'Fair Wear & Tear' });
  } else {
    score += 5;
    factors.push({ label: 'Condition', status: 'poor', desc: 'Condition Requires Attention or Repair' });
  }

  // 2. Maintenance Service Frequency (Max 25 pts)
  const openMaint = assetMaintenance.filter((m) => m.status === 'In Progress' || m.status === 'Pending').length;
  const totalMaint = assetMaintenance.length;

  if (openMaint > 0) {
    score += 5;
    factors.push({ label: 'Service', status: 'poor', desc: `${openMaint} Active Maintenance Work Order(s)` });
  } else if (totalMaint === 0) {
    score += 25;
    factors.push({ label: 'Service', status: 'good', desc: 'Zero Unscheduled Maintenance Events' });
  } else if (totalMaint <= 2) {
    score += 20;
    factors.push({ label: 'Service', status: 'good', desc: `${totalMaint} Routine Service Record(s)` });
  } else {
    score += 10;
    factors.push({ label: 'Service', status: 'fair', desc: `Frequent Maintenance History (${totalMaint} tickets)` });
  }

  // 3. Asset Operational Age (Max 20 pts)
  const acqYear = new Date(asset.acquisitionDate || Date.now()).getFullYear();
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - acqYear);

  if (ageYears <= 1) {
    score += 20;
    factors.push({ label: 'Age', status: 'good', desc: 'Deployed within current operational year' });
  } else if (ageYears <= 3) {
    score += 15;
    factors.push({ label: 'Age', status: 'good', desc: `${ageYears} Years Operational Lifecycle` });
  } else if (ageYears <= 5) {
    score += 10;
    factors.push({ label: 'Age', status: 'fair', desc: `${ageYears} Years in Service (Mid-life)` });
  } else {
    score += 5;
    factors.push({ label: 'Age', status: 'poor', desc: `Legacy Equipment (${ageYears}+ Years)` });
  }

  // 4. Current Operational Status (Max 20 pts)
  const statusLower = (asset.status || '').toLowerCase();
  if (statusLower === 'available' || statusLower === 'allocated' || statusLower === 'reserved') {
    score += 20;
    factors.push({ label: 'Status', status: 'good', desc: `Nominal Status: ${asset.status}` });
  } else if (statusLower === 'under maintenance' || statusLower === 'under_maintenance') {
    score += 0;
    factors.push({ label: 'Status', status: 'poor', desc: 'Currently Locked in Maintenance Bay' });
  } else if (statusLower === 'lost' || statusLower === 'retired' || statusLower === 'disposed') {
    score += 0;
    factors.push({ label: 'Status', status: 'poor', desc: `Non-operational Lifecycle: ${asset.status}` });
  }

  // 5. Audit Discrepancies Penalty
  const hasAuditDiscrepancy = assetAuditItems.some((ai) => ai.status === 'Missing' || ai.status === 'Damaged');
  if (hasAuditDiscrepancy) {
    score = Math.max(10, score - 25);
    factors.push({ label: 'Audit', status: 'poor', desc: 'Flagged during physical audit cycle' });
  }

  // Normalize final score bounds (0-100)
  score = Math.min(100, Math.max(0, score));

  let level: HealthScoreLevel = 'Good';
  let colorClass = 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
  let badgeBg = 'bg-blue-50 dark:bg-blue-950/50';
  let badgeText = 'text-blue-700 dark:text-blue-300';
  let badgeBorder = 'border-blue-200 dark:border-blue-800';

  if (score >= 85) {
    level = 'Excellent';
    colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    badgeBg = 'bg-emerald-50 dark:bg-emerald-950/50';
    badgeText = 'text-emerald-700 dark:text-emerald-300';
    badgeBorder = 'border-emerald-200 dark:border-emerald-800';
  } else if (score >= 70) {
    level = 'Good';
    colorClass = 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    badgeBg = 'bg-sky-50 dark:bg-sky-950/50';
    badgeText = 'text-sky-700 dark:text-sky-300';
    badgeBorder = 'border-sky-200 dark:border-sky-800';
  } else if (score >= 50) {
    level = 'Attention';
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    badgeBg = 'bg-amber-50 dark:bg-amber-950/50';
    badgeText = 'text-amber-700 dark:text-amber-300';
    badgeBorder = 'border-amber-200 dark:border-amber-800';
  } else {
    level = 'Critical';
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900';
    badgeBg = 'bg-rose-50 dark:bg-rose-950/50';
    badgeText = 'text-rose-700 dark:text-rose-300';
    badgeBorder = 'border-rose-200 dark:border-rose-900';
  }

  return {
    score,
    level,
    colorClass,
    badgeBg,
    badgeText,
    badgeBorder,
    factors,
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  actor?: string;
  type: 'registered' | 'allocated' | 'transferred' | 'maintenance' | 'return' | 'audit' | 'status_change';
  statusBadge?: string;
}

/**
 * Builds a chronological historical timeline for a specific asset
 */
export function buildAssetTimeline(
  asset: Asset,
  allocations: Allocation[] = [],
  maintenanceList: MaintenanceRequest[] = [],
  auditItems: AuditItem[] = [],
  activityLogs: ActivityLog[] = []
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // 1. Initial Registration
  events.push({
    id: `reg-${asset.id}`,
    date: asset.acquisitionDate || asset.createdAt || '2026-09-01',
    title: 'Asset Registered',
    description: `Asset registered with serial ${asset.serialNumber} at ${asset.location}. Initial status: Available.`,
    actor: 'System / Asset Manager',
    type: 'registered',
    statusBadge: 'Available',
  });

  // 2. Allocations & Returns
  allocations
    .filter((a) => a.assetId === asset.id)
    .forEach((alloc) => {
      events.push({
        id: `alloc-${alloc.id}`,
        date: alloc.allocationDate,
        title: 'Asset Allocated',
        description: `Allocated to custodian. Scheduled return: ${alloc.expectedReturnDate}.`,
        actor: alloc.allocatedBy || 'Custodian Manager',
        type: 'allocated',
        statusBadge: alloc.status,
      });

      if (alloc.returnDate || alloc.returnedDate) {
        events.push({
          id: `ret-${alloc.id}`,
          date: alloc.returnDate || alloc.returnedDate || alloc.expectedReturnDate,
          title: 'Asset Returned & Checked-In',
          description: alloc.returnNotes
            ? `Returned. Condition: ${alloc.returnCondition || 'Good'}. Notes: "${alloc.returnNotes}"`
            : `Returned in condition: ${alloc.returnCondition || 'Good'}. Restored to inventory.`,
          actor: 'Asset Manager',
          type: 'return',
          statusBadge: 'Available',
        });
      }
    });

  // 3. Maintenance Requests & Resolutions
  maintenanceList
    .filter((m) => m.assetId === asset.id)
    .forEach((m) => {
      events.push({
        id: `maint-req-${m.id}`,
        date: m.reportedAt ? m.reportedAt.split('T')[0] : '2026-09-15',
        title: 'Maintenance Requested',
        description: `Reported issue: ${m.issueDescription} (${m.priority} priority).`,
        actor: m.reportedByName || 'Staff Member',
        type: 'maintenance',
        statusBadge: m.status,
      });

      if (m.status === 'In Progress' || m.status === 'Resolved') {
        events.push({
          id: `maint-appr-${m.id}`,
          date: m.reportedAt ? m.reportedAt.split('T')[0] : '2026-09-16',
          title: 'Maintenance Approved',
          description: `Work order dispatched. Assigned Technician: ${m.technicianName || 'Certified Technician'}.`,
          actor: m.approvedBy || 'Asset Manager',
          type: 'maintenance',
          statusBadge: 'Under Maintenance',
        });
      }

      if (m.status === 'Resolved') {
        events.push({
          id: `maint-res-${m.id}`,
          date: m.resolvedAt ? m.resolvedAt.split('T')[0] : '2026-09-21',
          title: 'Maintenance Resolved & Released',
          description: m.resolutionNotes || 'Maintenance completed successfully. Asset returned to available service.',
          actor: m.technicianName || 'Certified Technician',
          type: 'maintenance',
          statusBadge: 'Available',
        });
      }
    });

  // 4. Audit Cycle Inspections
  auditItems
    .filter((ai) => ai.assetId === asset.id)
    .forEach((ai) => {
      events.push({
        id: `audit-${ai.id}`,
        date: ai.verifiedAt ? ai.verifiedAt.split('T')[0] : '2026-09-20',
        title: `Audit Inspection: ${ai.status}`,
        description: ai.notes ? `Inspected during audit cycle. Result: ${ai.status}. Notes: ${ai.notes}` : `Physical inspection confirmed status: ${ai.status}.`,
        actor: ai.verifiedBy || 'Internal Auditor',
        type: 'audit',
        statusBadge: ai.status,
      });
    });

  // 5. Activity Log links for this asset
  activityLogs
    .filter((log) => log.entityId === asset.id || log.details.includes(asset.assetTag))
    .forEach((log) => {
      if (
        !events.some(
          (e) => e.date === log.timestamp.split('T')[0] && e.title.toLowerCase().includes(log.action.toLowerCase())
        )
      ) {
        events.push({
          id: `log-${log.id}`,
          date: log.timestamp.split('T')[0],
          title: log.action,
          description: log.details,
          actor: `${log.userName} (${log.userRole || 'User'})`,
          type: 'status_change',
        });
      }
    });

  // Sort chronologically descending (newest first) or ascending
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
