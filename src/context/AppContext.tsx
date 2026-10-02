import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Department,
  AssetCategory,
  Asset,
  Allocation,
  TransferRequest,
  Booking,
  MaintenanceRequest,
  AuditCycle,
  AuditItem,
  Building,
  Floor,
  Seat,
  SeatAllocation,
  SeatRequest,
  AppNotification,
  ActivityLog,
  UserRole,
  AssetCondition,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_ASSETS,
  INITIAL_ALLOCATIONS,
  INITIAL_TRANSFERS,
  INITIAL_BOOKINGS,
  INITIAL_MAINTENANCE,
  INITIAL_AUDIT_CYCLES,
  INITIAL_AUDIT_ITEMS,
  INITIAL_BUILDINGS,
  INITIAL_FLOORS,
  INITIAL_SEATS,
  INITIAL_SEAT_ALLOCATIONS,
  INITIAL_SEAT_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/mockData';

interface KPIs {
  totalAssets: number;
  assetsAvailable: number;
  assetsAllocated: number;
  maintenanceCount: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueReturns: number;
  totalEmployees: number;
  totalDepartments: number;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  pendingSeatRequests: number;
  idleAssetsCount: number;
}

interface AppContextType {
  // Current session & auth
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  users: UserProfile[];
  
  // Data Collections
  departments: Department[];
  categories: AssetCategory[];
  assets: Asset[];
  allocations: Allocation[];
  transfers: TransferRequest[];
  bookings: Booking[];
  maintenanceRequests: MaintenanceRequest[];
  auditCycles: AuditCycle[];
  auditItems: AuditItem[];
  buildings: Building[];
  floors: Floor[];
  seats: Seat[];
  seatAllocations: SeatAllocation[];
  seatRequests: SeatRequest[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];

  // Computed KPIs
  kpis: KPIs;

  // Actions
  addAsset: (asset: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string; asset?: Asset };
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  allocateAsset: (params: { assetId: string; employeeId: string; expectedReturnDate: string; departmentId: string }) => { success: boolean; message: string };
  requestTransfer: (params: { assetId: string; toEmployeeId: string; toDepartmentId: string; reason: string }) => { success: boolean; message: string };
  approveTransfer: (transferId: string) => { success: boolean; message: string };
  rejectTransfer: (transferId: string) => { success: boolean; message: string };
  returnAsset: (allocationId: string, notes: string, condition: AssetCondition) => { success: boolean; message: string };
  createBooking: (params: { resourceId: string; title: string; purpose: string; startTime: string; endTime: string }) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => { success: boolean; message: string };
  submitMaintenanceRequest: (params: { assetId: string; description: string; priority: MaintenanceRequest['priority']; photos?: string[] }) => { success: boolean; message: string };
  updateMaintenanceStatus: (requestId: string, status: MaintenanceRequest['status'], technicianName?: string, resolutionNotes?: string) => void;
  createAuditCycle: (params: { title: string; departmentId?: string; location?: string; startDate: string; endDate: string }) => { success: boolean; message: string };
  verifyAuditItem: (itemId: string, status: AuditItem['status'], notes?: string) => void;
  closeAuditCycle: (cycleId: string) => void;
  assignSeat: (seatId: string, employeeId: string) => { success: boolean; message: string };
  releaseSeat: (seatId: string) => { success: boolean; message: string };
  requestSeat: (floorId: string, seatId?: string, reason?: string) => { success: boolean; message: string };
  reviewSeatRequest: (requestId: string, approved: boolean) => void;
  promoteUserRole: (userId: string, newRole: UserRole) => { success: boolean; message: string };
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  addCategory: (category: Omit<AssetCategory, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'assetflow_storage_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with seed data
  const [isLoaded, setIsLoaded] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Sarah Jenkins (Admin)
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [categories, setCategories] = useState<AssetCategory[]>(INITIAL_CATEGORIES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [allocations, setAllocations] = useState<Allocation[]>(INITIAL_ALLOCATIONS);
  const [transfers, setTransfers] = useState<TransferRequest[]>(INITIAL_TRANSFERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [auditCycles, setAuditCycles] = useState<AuditCycle[]>(INITIAL_AUDIT_CYCLES);
  const [auditItems, setAuditItems] = useState<AuditItem[]>(INITIAL_AUDIT_ITEMS);
  const [buildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [floors] = useState<Floor[]>(INITIAL_FLOORS);
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [seatAllocations, setSeatAllocations] = useState<SeatAllocation[]>(INITIAL_SEAT_ALLOCATIONS);
  const [seatRequests, setSeatRequests] = useState<SeatRequest[]>(INITIAL_SEAT_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Restore state from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.assets && parsed.users) {
          setUsers(Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS);
          setDepartments(Array.isArray(parsed.departments) ? parsed.departments : INITIAL_DEPARTMENTS);
          setCategories(Array.isArray(parsed.categories) ? parsed.categories : INITIAL_CATEGORIES);
          setAssets(Array.isArray(parsed.assets) ? parsed.assets : INITIAL_ASSETS);
          setAllocations(Array.isArray(parsed.allocations) ? parsed.allocations : INITIAL_ALLOCATIONS);
          setTransfers(Array.isArray(parsed.transfers) ? parsed.transfers : INITIAL_TRANSFERS);
          setBookings(Array.isArray(parsed.bookings) ? parsed.bookings : INITIAL_BOOKINGS);
          setMaintenanceRequests(Array.isArray(parsed.maintenanceRequests) ? parsed.maintenanceRequests : INITIAL_MAINTENANCE);
          setAuditCycles(Array.isArray(parsed.auditCycles) ? parsed.auditCycles : INITIAL_AUDIT_CYCLES);
          setAuditItems(Array.isArray(parsed.auditItems) ? parsed.auditItems : INITIAL_AUDIT_ITEMS);
          setSeats(Array.isArray(parsed.seats) ? parsed.seats : INITIAL_SEATS);
          setSeatAllocations(Array.isArray(parsed.seatAllocations) ? parsed.seatAllocations : INITIAL_SEAT_ALLOCATIONS);
          setSeatRequests(Array.isArray(parsed.seatRequests) ? parsed.seatRequests : INITIAL_SEAT_REQUESTS);
          setNotifications(Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS);
          setActivityLogs(Array.isArray(parsed.activityLogs) ? parsed.activityLogs : INITIAL_ACTIVITY_LOGS);
          if (parsed.currentUserId && Array.isArray(parsed.users)) {
            const found = parsed.users.find((u: UserProfile) => u.id === parsed.currentUserId);
            if (found) setCurrentUser(found);
          }
        }
      }
    } catch {
      // Fallback to seed data on error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = {
        users,
        departments,
        categories,
        assets,
        allocations,
        transfers,
        bookings,
        maintenanceRequests,
        auditCycles,
        auditItems,
        seats,
        seatAllocations,
        seatRequests,
        notifications,
        activityLogs,
        currentUserId: currentUser.id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to sync to storage', e);
    }
  }, [
    isLoaded,
    users,
    departments,
    categories,
    assets,
    allocations,
    transfers,
    bookings,
    maintenanceRequests,
    auditCycles,
    auditItems,
    seats,
    seatAllocations,
    seatRequests,
    notifications,
    activityLogs,
    currentUser,
  ]);

  // Log activity helper
  const logActivity = (
    action: string,
    entityType: ActivityLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Add Notification helper
  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'info',
    targetRole?: UserRole,
    userId?: string,
    linkTab?: string
  ) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      targetRole,
      userId,
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTab,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Role Switcher
  const switchRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      addNotification(
        'Role Switched',
        `Switched active simulation to ${matched.name} (${role})`,
        'info',
        undefined,
        matched.id
      );
    }
  };

  // Reset demo data
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setDepartments(INITIAL_DEPARTMENTS);
    setCategories(INITIAL_CATEGORIES);
    setAssets(INITIAL_ASSETS);
    setAllocations(INITIAL_ALLOCATIONS);
    setTransfers(INITIAL_TRANSFERS);
    setBookings(INITIAL_BOOKINGS);
    setMaintenanceRequests(INITIAL_MAINTENANCE);
    setAuditCycles(INITIAL_AUDIT_CYCLES);
    setAuditItems(INITIAL_AUDIT_ITEMS);
    setSeats(INITIAL_SEATS);
    setSeatAllocations(INITIAL_SEAT_ALLOCATIONS);
    setSeatRequests(INITIAL_SEAT_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
  };

  // 1. ASSET MANAGEMENT
  const addAsset = (
    assetData: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'>
  ) => {
    // Generate next tag AF-XXXX
    const nextNumber = assets.length + 1;
    const padded = nextNumber.toString().padStart(4, '0');
    const assetTag = `AF-${padded}`;

    const newAsset: Asset = {
      ...assetData,
      id: `ast-${Date.now()}`,
      assetTag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAssets((prev) => [newAsset, ...prev]);
    logActivity('Registered Asset', 'Asset', newAsset.id, `Created ${newAsset.name} with Tag ${assetTag}`);
    addNotification('New Asset Added', `${newAsset.name} (${assetTag}) registered.`, 'success', 'Asset Manager');

    return { success: true, message: `Asset registered with Tag ${assetTag}`, asset: newAsset };
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    logActivity('Updated Asset', 'Asset', id, `Updated fields on asset ${id}`);
  };

  // 2. ALLOCATION MANAGEMENT with Conflict Prevention
  const allocateAsset = ({
    assetId,
    employeeId,
    expectedReturnDate,
    departmentId,
  }: {
    assetId: string;
    employeeId: string;
    expectedReturnDate: string;
    departmentId: string;
  }) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return { success: false, message: 'Asset not found.' };

    // Check if asset is under maintenance or retired/lost
    if (targetAsset.status === 'Under Maintenance') {
      return { success: false, message: 'Asset is currently Under Maintenance and cannot be allocated.' };
    }
    if (targetAsset.status === 'Lost' || targetAsset.status === 'Retired' || targetAsset.status === 'Disposed') {
      return { success: false, message: `Cannot allocate asset with status: ${targetAsset.status}` };
    }

    // Check if duplicate active allocation exists
    const existingAllocation = allocations.find(
      (a) => a.assetId === assetId && (a.status === 'Active' || a.status === 'Overdue')
    );
    if (existingAllocation) {
      const holder = users.find((u) => u.id === existingAllocation.employeeId)?.name || 'another employee';
      return {
        success: false,
        message: `Conflict: Asset is already actively allocated to ${holder}. Duplicate allocation blocked. Please submit a Transfer Request instead.`,
      };
    }

    const newAlloc: Allocation = {
      id: `alloc-${Date.now()}`,
      assetId,
      employeeId,
      departmentId,
      allocatedBy: currentUser.id,
      allocationDate: new Date().toISOString().split('T')[0],
      expectedReturnDate,
      status: 'Active',
    };

    setAllocations((prev) => [newAlloc, ...prev]);
    updateAsset(assetId, { status: 'Allocated' });

    const empName = users.find((u) => u.id === employeeId)?.name || 'Employee';
    logActivity(
      'Allocated Asset',
      'Allocation',
      newAlloc.id,
      `Allocated ${targetAsset.name} (${targetAsset.assetTag}) to ${empName}`
    );

    addNotification(
      'Asset Allocation',
      `You have been allocated ${targetAsset.name} (${targetAsset.assetTag}) until ${expectedReturnDate}.`,
      'success',
      undefined,
      employeeId,
      'assets'
    );

    return { success: true, message: `Successfully allocated to ${empName}.` };
  };

  // 3. TRANSFER REQUESTS & APPROVALS
  const requestTransfer = ({
    assetId,
    toEmployeeId,
    toDepartmentId,
    reason,
  }: {
    assetId: string;
    toEmployeeId: string;
    toDepartmentId: string;
    reason: string;
  }) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return { success: false, message: 'Asset not found.' };

    const activeAlloc = allocations.find(
      (a) => a.assetId === assetId && (a.status === 'Active' || a.status === 'Overdue')
    );
    const fromEmployeeId = activeAlloc ? activeAlloc.employeeId : currentUser.id;
    const fromDepartmentId = activeAlloc ? activeAlloc.departmentId : targetAsset.departmentId;

    const newTransfer: TransferRequest = {
      id: `trf-${Date.now()}`,
      assetId,
      fromEmployeeId,
      toEmployeeId,
      fromDepartmentId,
      toDepartmentId,
      requestedBy: currentUser.id,
      reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    logActivity(
      'Requested Asset Transfer',
      'Transfer',
      newTransfer.id,
      `Transfer requested for ${targetAsset.name} to ${users.find((u) => u.id === toEmployeeId)?.name}`
    );

    addNotification(
      'New Transfer Request',
      `Transfer requested for ${targetAsset.name} (${targetAsset.assetTag}).`,
      'info',
      'Asset Manager',
      undefined,
      'allocations'
    );

    return { success: true, message: 'Transfer request submitted for approval.' };
  };

  const approveTransfer = (transferId: string) => {
    if (currentUser.role === 'Employee') {
      return { success: false, message: 'Unauthorized: Only Managers and Admins can approve transfers.' };
    }

    const trf = transfers.find((t) => t.id === transferId);
    if (!trf || trf.status !== 'Pending') {
      return { success: false, message: 'Transfer request not found or already processed.' };
    }

    // 1. Mark existing active allocation as Returned
    setAllocations((prev) =>
      prev.map((a) =>
        a.assetId === trf.assetId && (a.status === 'Active' || a.status === 'Overdue')
          ? {
              ...a,
              status: 'Returned',
              returnedDate: new Date().toISOString().split('T')[0],
              returnNotes: `Transferred to ${users.find((u) => u.id === trf.toEmployeeId)?.name}`,
            }
          : a
      )
    );

    // 2. Create new active allocation
    const newAlloc: Allocation = {
      id: `alloc-${Date.now()}`,
      assetId: trf.assetId,
      employeeId: trf.toEmployeeId,
      departmentId: trf.toDepartmentId,
      allocatedBy: currentUser.id,
      allocationDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
    };
    setAllocations((prev) => [newAlloc, ...prev]);

    // 3. Mark transfer approved
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId ? { ...t, status: 'Approved', approvedBy: currentUser.id, updatedAt: new Date().toISOString() } : t
      )
    );

    // 4. Update asset department and location
    const toUser = users.find((u) => u.id === trf.toEmployeeId);
    updateAsset(trf.assetId, {
      departmentId: trf.toDepartmentId,
      location: toUser?.location || 'Assigned Desk',
      status: 'Allocated',
    });

    logActivity('Approved Transfer', 'Transfer', transferId, `Approved transfer of asset ${trf.assetId}`);
    addNotification('Transfer Approved', 'Your asset transfer request was approved.', 'success', undefined, trf.toEmployeeId, 'assets');

    return { success: true, message: 'Transfer approved and asset re-allocated.' };
  };

  const rejectTransfer = (transferId: string) => {
    if (currentUser.role === 'Employee') {
      return { success: false, message: 'Unauthorized.' };
    }
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'Rejected', updatedAt: new Date().toISOString() } : t))
    );
    logActivity('Rejected Transfer', 'Transfer', transferId, 'Rejected asset transfer');
    return { success: true, message: 'Transfer request rejected.' };
  };

  // 4. RETURN ASSET
  const returnAsset = (allocationId: string, notes: string, condition: AssetCondition) => {
    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc) return { success: false, message: 'Allocation not found.' };

    const todayStr = new Date().toISOString().split('T')[0];

    // Update allocation record
    setAllocations((prev) =>
      prev.map((a) =>
        a.id === allocationId
          ? {
              ...a,
              status: 'Returned',
              returnedDate: todayStr,
              returnNotes: notes,
              returnCondition: condition,
            }
          : a
      )
    );

    // Update asset status
    const newStatus = condition === 'Needs Repair' || condition === 'Damaged' ? 'Under Maintenance' : 'Available';
    updateAsset(alloc.assetId, {
      status: newStatus,
      condition,
    });

    logActivity('Returned Asset', 'Allocation', allocationId, `Returned with condition ${condition}. Notes: ${notes}`);
    addNotification('Asset Returned', `Asset checked in as ${newStatus}.`, 'info', 'Asset Manager');

    return { success: true, message: `Asset successfully returned. Current status: ${newStatus}.` };
  };

  // 5. RESOURCE BOOKING with Strict Overlap Prevention
  const createBooking = ({
    resourceId,
    title,
    purpose,
    startTime,
    endTime,
  }: {
    resourceId: string;
    title: string;
    purpose: string;
    startTime: string;
    endTime: string;
  }) => {
    const targetAsset = assets.find((a) => a.id === resourceId);
    if (!targetAsset) return { success: false, message: 'Resource not found.' };

    if (!targetAsset.isBookable) {
      return { success: false, message: 'This resource is not marked as bookable.' };
    }

    if (targetAsset.status === 'Under Maintenance') {
      return { success: false, message: 'This resource is under maintenance and cannot be booked.' };
    }

    const startTs = new Date(startTime).getTime();
    const endTs = new Date(endTime).getTime();

    if (endTs <= startTs) {
      return { success: false, message: 'End time must be after start time.' };
    }

    // Collision detection: (newStart < existingEnd && newEnd > existingStart)
    const conflict = bookings.find((b) => {
      if (b.resourceId !== resourceId) return false;
      if (b.status === 'Cancelled') return false;

      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      return startTs < bEnd && endTs > bStart;
    });

    if (conflict) {
      const conflictStartStr = new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const conflictEndStr = new Date(conflict.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        success: false,
        message: `Booking Conflict: "${conflict.title}" already holds this resource from ${conflictStartStr} to ${conflictEndStr}. Please choose a non-overlapping time slot.`,
      };
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      resourceId,
      userId: currentUser.id,
      userName: currentUser.name,
      title,
      purpose,
      startTime,
      endTime,
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    logActivity('Created Booking', 'Booking', newBooking.id, `Booked ${targetAsset.name} for "${title}"`);
    addNotification('Booking Confirmed', `Reserved ${targetAsset.name} from ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}`, 'success', undefined, currentUser.id, 'bookings');

    return { success: true, message: 'Reservation successfully confirmed!' };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    logActivity('Cancelled Booking', 'Booking', bookingId, 'Booking cancelled by user');
    return { success: true, message: 'Booking cancelled.' };
  };

  // 6. MAINTENANCE MANAGEMENT
  const submitMaintenanceRequest = ({
    assetId,
    description,
    priority,
    photos,
  }: {
    assetId: string;
    description: string;
    priority: MaintenanceRequest['priority'];
    photos?: string[];
  }) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return { success: false, message: 'Asset not found.' };

    const newMaint: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      assetId,
      reportedBy: currentUser.id,
      reportedByName: currentUser.name,
      issueDescription: description,
      priority,
      status: 'Pending',
      photos,
      reportedAt: new Date().toISOString(),
    };

    setMaintenanceRequests((prev) => [newMaint, ...prev]);
    logActivity('Submitted Maintenance Ticket', 'Maintenance', newMaint.id, `Reported issue for ${targetAsset.name}`);
    addNotification('New Maintenance Request', `Issue reported for ${targetAsset.name} (${targetAsset.assetTag}) [${priority} Priority]`, 'warning', 'Asset Manager', undefined, 'maintenance');

    return { success: true, message: 'Maintenance request logged successfully.' };
  };

  const updateMaintenanceStatus = (
    requestId: string,
    status: MaintenanceRequest['status'],
    technicianName?: string,
    resolutionNotes?: string
  ) => {
    const maint = maintenanceRequests.find((m) => m.id === requestId);
    if (!maint) return;

    setMaintenanceRequests((prev) =>
      prev.map((m) =>
        m.id === requestId
          ? {
              ...m,
              status,
              technicianName: technicianName || m.technicianName,
              resolutionNotes: resolutionNotes || m.resolutionNotes,
              resolvedAt: status === 'Resolved' ? new Date().toISOString() : m.resolvedAt,
            }
          : m
      )
    );

    // Update asset status
    if (status === 'In Progress' || status === 'Approved') {
      updateAsset(maint.assetId, { status: 'Under Maintenance' });
    } else if (status === 'Resolved') {
      updateAsset(maint.assetId, { status: 'Available', condition: 'Good' });
    }

    logActivity('Updated Maintenance', 'Maintenance', requestId, `Status updated to ${status}`);
    addNotification('Maintenance Status Updated', `Ticket status changed to ${status}`, 'info', undefined, maint.reportedBy, 'maintenance');
  };

  // 7. AUDIT CYCLES
  const createAuditCycle = ({
    title,
    departmentId,
    location,
    startDate,
    endDate,
  }: {
    title: string;
    departmentId?: string;
    location?: string;
    startDate: string;
    endDate: string;
  }) => {
    // Filter matching assets for the audit
    const matchingAssets = assets.filter((a) => {
      if (departmentId && a.departmentId !== departmentId) return false;
      if (location && !a.location.toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });

    const cycleId = `audit-${Date.now()}`;
    const newCycle: AuditCycle = {
      id: cycleId,
      title,
      departmentId,
      location: location || 'All Facilities',
      startDate,
      endDate,
      auditorId: currentUser.id,
      status: 'In Progress',
      totalAssetsCount: matchingAssets.length,
      verifiedCount: 0,
      missingCount: 0,
      damagedCount: 0,
    };

    const newItems: AuditItem[] = matchingAssets.map((a, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      cycleId,
      assetId: a.id,
      status: 'Pending',
    }));

    setAuditCycles((prev) => [newCycle, ...prev]);
    setAuditItems((prev) => [...prev, ...newItems]);

    logActivity('Started Audit Cycle', 'Audit', cycleId, `Created cycle "${title}" with ${matchingAssets.length} assets`);
    addNotification('New Audit Cycle Started', `Audit "${title}" initiated.`, 'info', 'Asset Manager', undefined, 'audits');

    return { success: true, message: `Audit cycle created with ${matchingAssets.length} assets to verify.` };
  };

  const verifyAuditItem = (itemId: string, status: AuditItem['status'], notes?: string) => {
    const item = auditItems.find((i) => i.id === itemId);
    if (!item) return;

    setAuditItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              status,
              notes: notes || i.notes,
              verifiedAt: new Date().toISOString(),
              verifiedBy: currentUser.name,
            }
          : i
      )
    );

    // Update parent cycle counts
    setAuditCycles((prev) =>
      prev.map((c) => {
        if (c.id !== item.cycleId) return c;
        const allItems = auditItems.map((i) => (i.id === itemId ? { ...i, status } : i));
        const verified = allItems.filter((i) => i.cycleId === c.id && i.status === 'Verified').length;
        const missing = allItems.filter((i) => i.cycleId === c.id && i.status === 'Missing').length;
        const damaged = allItems.filter((i) => i.cycleId === c.id && i.status === 'Damaged').length;

        return {
          ...c,
          verifiedCount: verified,
          missingCount: missing,
          damagedCount: damaged,
        };
      })
    );

    // If flagged Missing or Damaged, update asset status
    if (status === 'Missing') {
      updateAsset(item.assetId, { status: 'Lost' });
    } else if (status === 'Damaged') {
      updateAsset(item.assetId, { status: 'Under Maintenance', condition: 'Damaged' });
    }

    logActivity('Audited Asset Item', 'Audit', itemId, `Marked item as ${status}`);
  };

  const closeAuditCycle = (cycleId: string) => {
    setAuditCycles((prev) =>
      prev.map((c) => (c.id === cycleId ? { ...c, status: 'Closed' } : c))
    );
    logActivity('Closed Audit Cycle', 'Audit', cycleId, 'Audit locked and discrepancy report finalized');
    addNotification('Audit Cycle Closed', 'Discrepancy report generated and audit record locked.', 'success', 'Admin', undefined, 'audits');
  };

  // 8. SEAT MANAGEMENT
  const assignSeat = (seatId: string, employeeId: string) => {
    const targetSeat = seats.find((s) => s.id === seatId);
    if (!targetSeat) return { success: false, message: 'Seat not found.' };

    if (targetSeat.status === 'Occupied' && targetSeat.assignedEmployeeId !== employeeId) {
      const currentOccupant = users.find((u) => u.id === targetSeat.assignedEmployeeId)?.name || 'another employee';
      return { success: false, message: `Conflict: Seat ${targetSeat.seatNumber} is already occupied by ${currentOccupant}. Please release or transfer first.` };
    }

    // Release any previous seat of this employee
    setSeats((prev) =>
      prev.map((s) =>
        s.assignedEmployeeId === employeeId && s.id !== seatId
          ? { ...s, status: 'Available', assignedEmployeeId: undefined }
          : s.id === seatId
          ? { ...s, status: 'Occupied', assignedEmployeeId: employeeId }
          : s
      )
    );

    const newSeatAlloc: SeatAllocation = {
      id: `sa-${Date.now()}`,
      seatId,
      employeeId,
      allocatedDate: new Date().toISOString().split('T')[0],
      allocatedBy: currentUser.id,
      status: 'Active',
    };

    setSeatAllocations((prev) => [newSeatAlloc, ...prev]);

    const empName = users.find((u) => u.id === employeeId)?.name || 'Employee';
    logActivity('Assigned Seat', 'Seat', seatId, `Assigned Seat ${targetSeat.seatNumber} to ${empName}`);
    addNotification('Seat Allocated', `You have been assigned Seat ${targetSeat.seatNumber}.`, 'success', undefined, employeeId, 'seating');

    return { success: true, message: `Seat ${targetSeat.seatNumber} assigned to ${empName}.` };
  };

  const releaseSeat = (seatId: string) => {
    const targetSeat = seats.find((s) => s.id === seatId);
    if (!targetSeat) return { success: false, message: 'Seat not found.' };

    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, status: 'Available', assignedEmployeeId: undefined } : s))
    );

    setSeatAllocations((prev) =>
      prev.map((sa) => (sa.seatId === seatId && sa.status === 'Active' ? { ...sa, status: 'Released' } : sa))
    );

    logActivity('Released Seat', 'Seat', seatId, `Released Seat ${targetSeat.seatNumber}`);
    return { success: true, message: `Seat ${targetSeat.seatNumber} is now Available.` };
  };

  const requestSeat = (floorId: string, seatId?: string, reason: string = '') => {
    const newRequest: SeatRequest = {
      id: `sr-${Date.now()}`,
      floorId,
      seatId,
      employeeId: currentUser.id,
      reason,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };

    setSeatRequests((prev) => [newRequest, ...prev]);
    logActivity('Requested Seat', 'Seat', newRequest.id, `Seat requested on floor ${floorId}`);
    addNotification('New Seat Request', `${currentUser.name} requested a desk allocation.`, 'info', 'Admin', undefined, 'seating');

    return { success: true, message: 'Seat request sent to Facilities Admin.' };
  };

  const reviewSeatRequest = (requestId: string, approved: boolean) => {
    const req = seatRequests.find((r) => r.id === requestId);
    if (!req) return;

    setSeatRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: approved ? 'Approved' : 'Rejected', reviewedBy: currentUser.id } : r
      )
    );

    if (approved && req.seatId) {
      assignSeat(req.seatId, req.employeeId);
    }

    logActivity('Reviewed Seat Request', 'Seat', requestId, `Request ${approved ? 'Approved' : 'Rejected'}`);
    addNotification('Seat Request Update', `Your seat request was ${approved ? 'Approved' : 'Rejected'}.`, approved ? 'success' : 'error', undefined, req.employeeId, 'seating');
  };

  // 9. ORGANIZATION MANAGEMENT (Admin Only)
  const promoteUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser.role !== 'Admin') {
      return { success: false, message: 'Security Exception: Only Admins can modify employee roles.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    // If current session is the user being modified, sync
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }

    const targetUser = users.find((u) => u.id === userId);
    logActivity('Promoted Role', 'User', userId, `Promoted ${targetUser?.name} to ${newRole}`);
    addNotification('Role Assignment Updated', `Your account has been granted ${newRole} privileges.`, 'success', undefined, userId);

    return { success: true, message: `Successfully assigned ${newRole} role.` };
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => [...prev, newDept]);
    logActivity('Created Department', 'Department', newDept.id, `Created ${newDept.name} (${newDept.code})`);
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const addCategory = (cat: Omit<AssetCategory, 'id'>) => {
    const newCat: AssetCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    logActivity('Created Category', 'Asset', newCat.id, `Created category ${newCat.name}`);
  };

  // Notifications helper
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // COMPUTED KPIs (Real Database Calculations, Zero Hardcoding)
  const today = new Date().toISOString().split('T')[0];

  const totalAssets = assets.length;
  const assetsAvailable = assets.filter((a) => a.status === 'Available').length;
  const assetsAllocated = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter((a) => a.status === 'Under Maintenance').length;
  const activeBookings = bookings.filter((b) => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfers = transfers.filter((t) => t.status === 'Pending').length;

  const upcomingReturns = allocations.filter(
    (a) => a.status === 'Active' && a.expectedReturnDate >= today
  ).length;

  const overdueReturns = allocations.filter((a) => {
    if (a.status === 'Overdue') return true;
    if (a.status === 'Active' && a.expectedReturnDate < today) return true;
    return false;
  }).length;

  const totalEmployees = users.length;
  const totalDepartments = departments.length;
  const totalSeats = seats.length;
  const availableSeats = seats.filter((s) => s.status === 'Available').length;
  const occupiedSeats = seats.filter((s) => s.status === 'Occupied').length;
  const pendingSeatRequests = seatRequests.filter((r) => r.status === 'Pending').length;
  const idleAssetsCount = assets.filter((a) => a.status === 'Available' && !a.isBookable).length;

  const kpis: KPIs = {
    totalAssets,
    assetsAvailable,
    assetsAllocated,
    maintenanceCount,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns,
    totalEmployees,
    totalDepartments,
    totalSeats,
    availableSeats,
    occupiedSeats,
    pendingSeatRequests,
    idleAssetsCount,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        departments,
        categories,
        assets,
        allocations,
        transfers,
        bookings,
        maintenanceRequests,
        auditCycles,
        auditItems,
        buildings,
        floors,
        seats,
        seatAllocations,
        seatRequests,
        notifications,
        activityLogs,
        kpis,
        addAsset,
        updateAsset,
        allocateAsset,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        returnAsset,
        createBooking,
        cancelBooking,
        submitMaintenanceRequest,
        updateMaintenanceStatus,
        createAuditCycle,
        verifyAuditItem,
        closeAuditCycle,
        assignSeat,
        releaseSeat,
        requestSeat,
        reviewSeatRequest,
        promoteUserRole,
        addDepartment,
        updateDepartment,
        addCategory,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
