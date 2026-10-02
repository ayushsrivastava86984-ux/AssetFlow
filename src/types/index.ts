export type UserRole =
  | 'Admin'
  | 'Asset Manager'
  | 'Department Head'
  | 'Employee'
  | 'admin'
  | 'asset_manager'
  | 'department_head'
  | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName?: string;
  location: string;
  status: 'Active' | 'Inactive' | string;
  joinedDate?: string;
  avatar?: string;
  phone?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId?: string;
  headName?: string;
  parentId?: string;
  status: 'Active' | 'Inactive' | string;
  description?: string;
  employeeCount?: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  iconName?: string;
  customFields?: string[];
}

export type AssetCondition =
  | 'New'
  | 'Brand New'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Needs Repair'
  | 'Damaged'
  | 'new'
  | 'good'
  | 'fair'
  | 'poor';

export type AssetStatus =
  | 'Available'
  | 'Allocated'
  | 'Reserved'
  | 'Under Maintenance'
  | 'Lost'
  | 'Retired'
  | 'Disposed'
  | 'available'
  | 'allocated'
  | 'reserved'
  | 'under_maintenance'
  | 'lost'
  | 'retired'
  | 'disposed';

export interface Asset {
  id: string;
  assetTag: string; // e.g. AF-0001
  name: string;
  categoryId: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number; // for reporting only
  condition: AssetCondition;
  departmentId: string;
  location: string;
  photos?: string[];
  isBookable: boolean;
  status: AssetStatus;
  notes?: string;
  specs?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Allocation {
  id: string;
  assetId: string;
  employeeId: string;
  departmentId: string;
  allocatedBy: string;
  allocationDate: string;
  expectedReturnDate: string;
  returnDate?: string;
  returnedDate?: string;
  returnCondition?: AssetCondition;
  returnNotes?: string;
  status: 'Active' | 'Returned' | 'Overdue' | 'active' | 'returned' | 'transferred' | string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  fromDepartmentId: string;
  toDepartmentId: string;
  requestedBy: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  title: string;
  purpose: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus =
  | 'Pending'
  | 'Approved'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'resolved';

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  reportedBy: string;
  reportedByName?: string;
  issueDescription: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  technicianName?: string;
  approvedBy?: string;
  resolutionNotes?: string;
  reportedAt?: string;
  resolvedAt?: string;
  estimatedCost?: number;
  photos?: string[];
  photo_url?: string;
}

export interface AuditCycle {
  id: string;
  title: string;
  departmentId?: string;
  location: string;
  startDate: string;
  endDate: string;
  auditorId: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Locked' | 'Closed' | 'draft' | 'in_progress' | 'completed' | 'locked' | 'closed';
  totalAssetsCount: number;
  verifiedCount: number;
  missingCount: number;
  damagedCount: number;
}

export type AuditItemStatus = 'Pending' | 'Verified' | 'Missing' | 'Damaged' | 'pending' | 'verified' | 'missing' | 'damaged';

export interface AuditItem {
  id: string;
  cycleId: string;
  assetId: string;
  status: AuditItemStatus;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
}

export type SeatStatus =
  | 'Available'
  | 'Occupied'
  | 'Reserved'
  | 'Inactive'
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'inactive';

export interface Seat {
  id: string;
  floorId: string;
  seatNumber: string;
  zone: string;
  status: SeatStatus;
  assignedEmployeeId?: string;
  departmentId?: string;
  amenities?: string[];
}

export interface SeatAllocation {
  id: string;
  seatId: string;
  employeeId: string;
  allocatedDate: string;
  allocatedBy: string;
  status: 'Active' | 'Released' | 'active' | 'released';
  releasedDate?: string;
}

export interface SeatRequest {
  id: string;
  floorId: string;
  seatId?: string;
  employeeId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedBy?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success' | string;
  isRead: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'asset' | 'maintenance' | 'booking' | 'transfer' | 'audit' | 'seat';
  is_read: boolean;
  link_to?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
