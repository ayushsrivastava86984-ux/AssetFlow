import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  CalendarCheck,
  Wrench,
  ClipboardCheck,
  Armchair,
  Building2,
  BarChart3,
  Bot,
  History,
  ShieldAlert,
  Search,
  Command,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCommandCenter?: () => void;
  onOpenDemo?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenCommandCenter,
  onOpenDemo,
}) => {
  const { currentUser, kpis } = useApp();

  const role = currentUser.role;

  // Role-specific navigation matrix (Section 7 Requirement)
  // Admin: Dashboard, Organization, Assets, Allocations, Bookings, Maintenance, Audits, Seating, Reports, Activity Logs
  // Asset Manager: Dashboard, Assets, Allocations, Bookings, Maintenance, Audits, Seating, Reports, Activity Logs
  // Department Head: Dashboard, My Department, Assets, Bookings, Requests (Allocations), Seating, Reports
  // Employee: Dashboard, My Assets, Book Resource, Maintenance, My Requests, Seating

  const getNavItems = () => {
    if (role === 'Admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'core' },
        { id: 'organization', label: 'Organization & Team', icon: Building2, section: 'core' },
        { id: 'assets', label: 'Asset Directory', icon: Boxes, badge: kpis.totalAssets, section: 'operations' },
        {
          id: 'allocations',
          label: 'Allocations & Transfers',
          icon: ArrowRightLeft,
          badge: kpis.overdueReturns > 0 ? `${kpis.overdueReturns} overdue` : null,
          badgeType: 'danger',
          section: 'operations',
        },
        { id: 'bookings', label: 'Resource Bookings', icon: CalendarCheck, badge: kpis.activeBookings || null, section: 'operations' },
        { id: 'maintenance', label: 'Maintenance Center', icon: Wrench, badge: kpis.maintenanceCount || null, badgeType: 'warning', section: 'operations' },
        { id: 'audits', label: 'Asset Audits', icon: ClipboardCheck, section: 'governance' },
        { id: 'seating', label: 'Seat Allocation', icon: Armchair, badge: kpis.pendingSeatRequests ? `${kpis.pendingSeatRequests} req` : null, section: 'governance' },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'governance' },
        { id: 'activity', label: 'Audit Trail & Logs', icon: History, section: 'intelligence' },
        { id: 'assistant', label: 'AI Asset Copilot', icon: Bot, badge: 'Smart', badgeType: 'ai', section: 'intelligence' },
      ];
    }

    if (role === 'Asset Manager') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'core' },
        { id: 'assets', label: 'Asset Directory', icon: Boxes, badge: kpis.totalAssets, section: 'operations' },
        {
          id: 'allocations',
          label: 'Allocations & Transfers',
          icon: ArrowRightLeft,
          badge: kpis.overdueReturns > 0 ? `${kpis.overdueReturns} overdue` : null,
          badgeType: 'danger',
          section: 'operations',
        },
        { id: 'bookings', label: 'Resource Bookings', icon: CalendarCheck, badge: kpis.activeBookings || null, section: 'operations' },
        { id: 'maintenance', label: 'Maintenance Center', icon: Wrench, badge: kpis.maintenanceCount || null, badgeType: 'warning', section: 'operations' },
        { id: 'audits', label: 'Asset Audits', icon: ClipboardCheck, section: 'governance' },
        { id: 'seating', label: 'Seat Allocation', icon: Armchair, section: 'governance' },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'governance' },
        { id: 'activity', label: 'Audit Trail & Logs', icon: History, section: 'intelligence' },
        { id: 'assistant', label: 'AI Asset Copilot', icon: Bot, badge: 'Smart', badgeType: 'ai', section: 'intelligence' },
      ];
    }

    if (role === 'Department Head') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'core' },
        { id: 'organization', label: 'My Department', icon: Building2, section: 'core' },
        { id: 'assets', label: 'Department Assets', icon: Boxes, badge: kpis.totalAssets, section: 'operations' },
        { id: 'bookings', label: 'Resource Bookings', icon: CalendarCheck, section: 'operations' },
        { id: 'allocations', label: 'Approval Requests', icon: ArrowRightLeft, badge: kpis.pendingTransfers || null, section: 'operations' },
        { id: 'seating', label: 'Seat Allocation', icon: Armchair, section: 'governance' },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'governance' },
        { id: 'assistant', label: 'AI Asset Copilot', icon: Bot, badge: 'Smart', badgeType: 'ai', section: 'intelligence' },
      ];
    }

    // Default: Employee
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'core' },
      { id: 'assets', label: 'My Assets', icon: Boxes, section: 'operations' },
      { id: 'bookings', label: 'Book Resource', icon: CalendarCheck, section: 'operations' },
      { id: 'maintenance', label: 'Report Issue', icon: Wrench, section: 'operations' },
      { id: 'allocations', label: 'My Requests & Handover', icon: ArrowRightLeft, section: 'operations' },
      { id: 'seating', label: 'My Seat / Desk', icon: Armchair, section: 'governance' },
      { id: 'assistant', label: 'AI Asset Copilot', icon: Bot, badge: 'Smart', badgeType: 'ai', section: 'intelligence' },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 select-none">
      {/* Top Command Center Trigger */}
      <div className="p-3.5 border-b border-slate-800">
        <button
          onClick={onOpenCommandCenter}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Command Center</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-5">
        {/* Navigation Items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeType === 'danger'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.badgeType === 'warning'
                        ? 'bg-amber-500/20 text-amber-300'
                        : item.badgeType === 'ai'
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 23-Step Signature Demo Runner Button */}
        {onOpenDemo && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={onOpenDemo}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 hover:from-blue-900/90 hover:to-indigo-900/90 border border-blue-800/60 text-blue-200 text-xs font-medium flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-white">Signature Demo</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">
                23 Steps
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Role Footer Card */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 m-3 rounded-xl">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Active Persona</span>
          <span className="font-semibold text-blue-400">{currentUser.role}</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          {currentUser.departmentName || 'Enterprise'}
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Security RLS Enforced</span>
        </div>
      </div>
    </aside>
  );
};
