import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { PlayerDock } from '../components/PlayerDock';
import { QueueSheet } from '../components/QueueSheet';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopTopBar } from './DesktopTopBar';
import { MobileHeader } from './MobileHeader';
import { MobileNavDrawer } from './MobileNavDrawer';

const SIDEBAR_KEY = 'sidebar-collapsed';

export function AppLayout() {
  const fetchAll = useDataStore((s) => s.fetchAll);
  useKeyboard();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === '1',
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="h-full flex flex-col md:flex-row bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <DesktopSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Mobile header + drawer */}
      <MobileNavDrawer open={mobileMenuOpen} onClose={closeMobileMenu} />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />
        <DesktopTopBar />

        <main className="flex-1 flex overflow-hidden">
          <Outlet />
        </main>

        <PlayerDock />
        <QueueSheet />
      </div>
    </div>
  );
}
