import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useDataStore } from './store/dataStore';
import { useKeyboard } from './hooks/useKeyboard';
import { PlayerDock } from './components/PlayerDock';
import { QueueSheet } from './components/QueueSheet';
import { ArtistGrid } from './pages/ArtistGrid';
import { ArtistDetail } from './pages/ArtistDetail';

function AppShell() {
  const fetchAll = useDataStore((s) => s.fetchAll);
  useKeyboard();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      {/* Nav */}
      <header className="h-14 shrink-0 border-b border-border flex items-center px-5 gap-4 z-20">
        <Link
          to="/"
          className="text-text-primary text-sm font-semibold uppercase tracking-widest hover:text-gold transition-colors"
        >
          Kirtan Sewa
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<ArtistGrid />} />
          <Route path="/artist/:slug" element={<ArtistDetail />} />
        </Routes>
      </main>

      <PlayerDock />
      <QueueSheet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
