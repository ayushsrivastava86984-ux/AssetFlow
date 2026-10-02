import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetDirectoryView } from './components/assets/AssetDirectoryView';
import { AllocationView } from './components/allocations/AllocationView';
import { BookingCalendarView } from './components/bookings/BookingCalendarView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { AuditView } from './components/audits/AuditView';
import { SeatAllocationView } from './components/seating/SeatAllocationView';
import { OrganizationView } from './components/organization/OrganizationView';
import { ReportsView } from './components/reports/ReportsView';
import { AssetFlowAIAssistant } from './components/assistant/AssetFlowAIAssistant';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { CommandPalette } from './components/common/CommandPalette';
import { QuickActionsFloating } from './components/common/QuickActionsFloating';
import { SignatureScenarioModal } from './components/demo/SignatureScenarioModal';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [targetAssetForAction, setTargetAssetForAction] = useState<string | undefined>(undefined);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAllocate = (assetId: string) => {
    setTargetAssetForAction(assetId);
    setCurrentTab('allocations');
  };

  const handleOpenTransfer = (assetId: string) => {
    setTargetAssetForAction(assetId);
    setCurrentTab('allocations');
  };

  const handleOpenMaintenance = (assetId: string) => {
    setTargetAssetForAction(assetId);
    setCurrentTab('maintenance');
  };

  const handleSearchSelect = (assetId: string) => {
    setTargetAssetForAction(assetId);
    setCurrentTab('assets');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCommandCenter={() => setIsCommandPaletteOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />

      {/* Main App Container */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Global Top Navbar */}
        <Navbar
          onSearchSelect={handleSearchSelect}
          onNavigateTab={setCurrentTab}
          onOpenCommandCenter={() => setIsCommandPaletteOpen(true)}
          onOpenDemo={() => setIsDemoModalOpen(true)}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigate={setCurrentTab}
                onOpenAssetRegister={() => setCurrentTab('assets')}
                onOpenAllocateModal={() => setCurrentTab('allocations')}
                onOpenBookingModal={() => setCurrentTab('bookings')}
                onOpenDemo={() => setIsDemoModalOpen(true)}
              />
            )}

            {currentTab === 'assets' && (
              <AssetDirectoryView
                onOpenAllocate={handleOpenAllocate}
                onOpenTransfer={handleOpenTransfer}
                onOpenMaintenance={handleOpenMaintenance}
              />
            )}

            {currentTab === 'allocations' && (
              <AllocationView initialAssetId={targetAssetForAction} />
            )}

            {currentTab === 'bookings' && <BookingCalendarView />}

            {currentTab === 'maintenance' && (
              <MaintenanceView initialAssetId={targetAssetForAction} />
            )}

            {currentTab === 'audits' && <AuditView />}

            {currentTab === 'seating' && <SeatAllocationView />}

            {currentTab === 'organization' && <OrganizationView />}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'assistant' && <AssetFlowAIAssistant />}

            {currentTab === 'activity' && <ActivityLogView />}
          </div>
        </main>
      </div>

      {/* Global Command Center (Cmd+K) Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setCurrentTab}
        onSelectAsset={handleSearchSelect}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />

      {/* 23-Step Signature Demo Scenario Modal */}
      <SignatureScenarioModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigateTab={setCurrentTab}
      />

      {/* Floating Quick Action Center */}
      <QuickActionsFloating
        onNavigateTab={setCurrentTab}
        onOpenAssetRegister={() => setCurrentTab('assets')}
        onOpenBookingModal={() => setCurrentTab('bookings')}
        onOpenAllocateModal={() => setCurrentTab('allocations')}
        onOpenMaintenanceModal={() => setCurrentTab('maintenance')}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
