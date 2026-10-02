import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Building2,
  FolderTree,
  Users,
  Plus,
  ShieldCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Tag,
  MapPin,
  Mail,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const OrganizationView: React.FC = () => {
  const {
    departments,
    categories,
    users,
    assets,
    allocations,
    seats,
    addDepartment,
    updateDepartment,
    addCategory,
    promoteUserRole,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');
  const [deptParentId, setDeptParentId] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catFields, setCatFields] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Employee Search and Promotion
  const [empSearch, setEmpSearch] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<string | null>(null);
  const [promoteRole, setPromoteRole] = useState<UserRole>('Asset Manager');
  const [promoteFeedback, setPromoteFeedback] = useState<{ error?: string; success?: string }>({});

  const isAdmin = currentUser.role === 'Admin';

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    addDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      headId: deptHeadId || undefined,
      headName: users.find((u) => u.id === deptHeadId)?.name,
      parentId: deptParentId || undefined,
      status: 'Active',
      description: deptDesc.trim(),
    });

    setIsDeptModalOpen(false);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
  };

  const handleCreateCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catCode.trim()) return;

    const fieldsArray = catFields
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    addCategory({
      name: catName.trim(),
      code: catCode.trim().toUpperCase(),
      customFields: fieldsArray,
      description: catDesc.trim(),
    });

    setIsCatModalOpen(false);
    setCatName('');
    setCatCode('');
    setCatFields('');
    setCatDesc('');
  };

  const handlePromoteSubmit = (userId: string) => {
    setPromoteFeedback({});
    const res = promoteUserRole(userId, promoteRole);
    if (res.success) {
      setPromoteFeedback({ success: res.message });
      setTimeout(() => setPromoteFeedback({}), 2000);
    } else {
      setPromoteFeedback({ error: res.message });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!empSearch.trim()) return true;
    const q = empSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.departmentName?.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q)
    );
  });

  const detailUser = users.find((u) => u.id === selectedUserForDetail);
  const userAllocations = allocations.filter(
    (a) => a.employeeId === selectedUserForDetail && (a.status === 'Active' || a.status === 'Overdue')
  );
  const userSeat = seats.find((s) => s.assignedEmployeeId === selectedUserForDetail);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Enterprise Organization & Access Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200">
              Admin Governance Tier
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure business departments, customize asset taxonomy, and promote verified employee roles.
          </p>
        </div>

        {!isAdmin && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Read-only: Switch to Admin role in top bar to execute changes.</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Asset Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory & Roles ({users.length})</span>
        </button>
      </div>

      {/* Tab A: Department Management */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Department hierarchies with parent-child structuring and assigned heads.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptUsersCount = users.filter((u) => u.departmentId === dept.id).length;
              const deptAssetsCount = assets.filter((a) => a.departmentId === dept.id).length;
              const parentDept = departments.find((d) => d.id === dept.parentId);

              return (
                <div
                  key={dept.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                        {dept.code}
                      </span>
                      <Badge status={dept.status} size="sm" />
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                      {dept.name}
                    </h3>

                    {parentDept && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>Parent:</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {parentDept.name}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {dept.description || 'No description entered.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Head: <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.headName || 'Vacant'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{deptUsersCount}</span> staff •{' '}
                      <span className="font-bold text-slate-900 dark:text-white">{deptAssetsCount}</span> assets
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab B: Asset Category Management */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Taxonomy classification with customizable metadata attributes.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const catAssets = assets.filter((a) => a.categoryId === cat.id);

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {cat.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {catAssets.length} Assets
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {cat.description || 'Standard catalog category.'}
                    </p>

                    {cat.customFields && cat.customFields.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Attribute Fields
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.customFields.map((f, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab C: Employee Directory & Role Governance */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, role, dept..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <p className="text-xs text-slate-400">
              Rule: Only Admins can modify or elevate employee roles.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Department & Location</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Allocated Custody</th>
                    <th className="py-3 px-4 text-right">Role Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => {
                    const activeAllocCount = allocations.filter(
                      (a) => a.employeeId === user.id && (a.status === 'Active' || a.status === 'Overdue')
                    ).length;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedUserForDetail(user.id)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 text-left flex items-center gap-2"
                          >
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {user.name[0]}
                            </div>
                            <span>{user.name}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {user.email}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {user.departmentName}
                          </div>
                          <div className="text-[11px] text-slate-400">{user.location}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge status={user.role} size="sm" />
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {activeAllocCount}
                          </span>{' '}
                          <span className="text-slate-400">devices</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isAdmin ? (
                            <div className="inline-flex items-center gap-1.5">
                              <select
                                defaultValue={user.role}
                                onChange={(e) => {
                                  promoteUserRole(user.id, e.target.value as UserRole);
                                }}
                                className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                              >
                                <option value="Employee">Employee</option>
                                <option value="Department Head">Department Head</option>
                                <option value="Asset Manager">Asset Manager</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail & Resource History Modal */}
      {detailUser && (
        <Modal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          title={`Employee Custody Profile: ${detailUser.name}`}
          subtitle={`${detailUser.role} • ${detailUser.departmentName}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-medium text-slate-900 dark:text-white">{detailUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Desk</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {userSeat ? `Seat ${userSeat.seatNumber} (${userSeat.zone})` : 'No permanent desk assigned'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Currently Assigned Hardware & Assets ({userAllocations.length})
              </h4>
              {userAllocations.length > 0 ? (
                <div className="space-y-2">
                  {userAllocations.map((a) => {
                    const ast = assets.find((x) => x.id === a.assetId);
                    return (
                      <div
                        key={a.id}
                        className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {ast?.assetTag}
                          </span>
                          <div className="font-semibold text-slate-900 dark:text-white">{ast?.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Due for return: {a.expectedReturnDate}
                          </div>
                        </div>
                        <Badge status={a.status} size="sm" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  No active physical assets checked out by this employee.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Add Business Department"
        subtitle="Establish organizational hierarchy and cost center"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Cybersecurity & InfoSec"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                placeholder="e.g. SEC"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Head
            </label>
            <select
              value={deptHeadId}
              onChange={(e) => setDeptHeadId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Department Head (Optional)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Parent Department (Optional Hierarchy)
            </label>
            <select
              value={deptParentId}
              onChange={(e) => setDeptParentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">None (Top Level Department)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Infrastructure hardening, endpoint protection, and security compliance."
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Asset Category"
        subtitle="Specify category classification and custom attribute specifications"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCat} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Drones & Robotics"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Code *
              </label>
              <input
                type="text"
                placeholder="e.g. ROBOT"
                value={catCode}
                onChange={(e) => setCatCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Specification Fields (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Battery Life, Max Payload, Flight Controller"
              value={catFields}
              onChange={(e) => setCatFields(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Autonomous inspection drones, robotic arms, and LiDAR rovers."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
