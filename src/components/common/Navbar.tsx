import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from './Badge';

interface NavbarProps {
  onSearchSelect?: (assetId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCommandCenter?: () => void;
  onOpenDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchSelect,
  onNavigateTab,
  onOpenCommandCenter,
  onOpenDemo,
}) => {
  const {
    currentUser,
    switchRole,
    users,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
    assets,
    kpis,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Filter search results
  const searchResults = searchQuery.trim()
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.location.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const roles: UserRole[] = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];

  const handleSelectAsset = (assetId: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    if (onSearchSelect) onSearchSelect(assetId);
    if (onNavigateTab) onNavigateTab('assets');
  };

  const handleNotifClick = (notifId: string, linkTab?: string) => {
    markNotificationRead(notifId);
    setShowNotifMenu(false);
    if (linkTab && onNavigateTab) {
      onNavigateTab(linkTab);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                AssetFlow
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Live Overdue Alert Capsule */}
        {kpis.overdueReturns > 0 && (
          <div
            onClick={() => onNavigateTab && onNavigateTab('allocations')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-semibold cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>{kpis.overdueReturns} Overdue Asset Return</span>
          </div>
        )}
      </div>

      {/* Global Command Center Search Bar */}
      <div
        ref={searchRef}
        onClick={onOpenCommandCenter}
        className="relative hidden md:block w-72 lg:w-96 cursor-pointer"
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            readOnly={!!onOpenCommandCenter}
            placeholder="Command Center: Search assets, staff, tickets... (⌘K)"
            value={searchQuery}
            onClick={onOpenCommandCenter}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => {
              if (onOpenCommandCenter) onOpenCommandCenter();
              else setShowSearchResults(true);
            }}
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-500 font-mono">
            ⌘K
          </div>
        </div>

        {showSearchResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Asset Directory Matches
            </div>
            {searchResults.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectAsset(item.id)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {item.assetTag}
                        </span>
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        SN: {item.serialNumber} • {item.location}
                      </div>
                    </div>
                    <Badge status={item.status} size="sm" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No assets matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Role Switcher, Notifications, Demo Reset */}
      <div className="flex items-center gap-2.5">
        {/* 23-Step Signature Demo Button */}
        {onOpenDemo && (
          <button
            onClick={onOpenDemo}
            title="Launch 23-Step Signature Demo Walkthrough"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Signature Demo</span>
          </button>
        )}

        {/* Reset Demo Data Button */}
        {confirmReset ? (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <button
              onClick={() => {
                resetAllData();
                setConfirmReset(false);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            title="Reset Database to Clean Demo State"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        )}

        {/* Notification Center */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    Notifications
                  </span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length > 0 ? (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n.id, n.linkTab)}
                      className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & Active User */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-slate-50 dark:bg-slate-800/80"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-inner">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Role Permission Simulator</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Test role-based access control across all 4 system tiers:
                </p>
              </div>

              <div className="p-2 space-y-1">
                {roles.map((role) => {
                  const sampleUser = users.find((u) => u.role === role);
                  const isCurrent = currentUser.role === role;

                  return (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {role}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sampleUser?.name} • {sampleUser?.departmentName}
                        </div>
                      </div>
                      <Badge status={role} size="sm" />
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Logged in as: <span className="font-mono text-slate-600 dark:text-slate-300">{currentUser.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
