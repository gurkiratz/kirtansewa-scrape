import { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { usePlayerStore } from '../store/playerStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { PlayerDock } from '../components/PlayerDock';
import { QueueSheet } from '../components/QueueSheet';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopTopBar } from './DesktopTopBar';
import { MobileHeader } from './MobileHeader';
import { MobileNavDrawer } from './MobileNavDrawer';

const DEFAULT_TITLE = 'Kirtan Sewa';
const DEFAULT_FAVICON = '/favicon.svg';

function getFaviconLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  return link;
}

function setFavicon(url: string, type: string) {
  const link = getFaviconLink();
  link.type = type;
  link.href = url;
}

const SIDEBAR_KEY = 'sidebar-collapsed';

export function AppLayout() {
  const fetchAll = useDataStore((s) => s.fetchAll);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  useKeyboard();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const faviconObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    const track = currentIndex >= 0 ? queue[currentIndex] : null;

    if (track) {
      const parts = [track.displayName, track.artistLabel].filter(Boolean);
      document.title = parts.join(' · ') + ' | ' + DEFAULT_TITLE;
    } else {
      document.title = DEFAULT_TITLE;
    }

    if (faviconObjectUrl.current) {
      URL.revokeObjectURL(faviconObjectUrl.current);
      faviconObjectUrl.current = null;
    }

    if (!track?.coverUrl) {
      setFavicon(DEFAULT_FAVICON, 'image/svg+xml');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const aspect = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (aspect > 1) {
        sw = img.height;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        faviconObjectUrl.current = url;
        setFavicon(url, 'image/png');
      });
    };
    img.onerror = () => {
      setFavicon(DEFAULT_FAVICON, 'image/svg+xml');
    };
    img.src = track.coverUrl;

    return () => {
      if (faviconObjectUrl.current) {
        URL.revokeObjectURL(faviconObjectUrl.current);
        faviconObjectUrl.current = null;
      }
    };
  }, [queue, currentIndex]);

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

      <AddToPlaylistModal />
    </div>
  );
}
