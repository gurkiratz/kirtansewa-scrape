import { Menu, Search, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

interface Props {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const pushQuery = (value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value) {
        navigate(`/?q=${encodeURIComponent(value)}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 250);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    pushQuery(v);
  };

  return (
    <header className="md:hidden h-14 shrink-0 border-b border-border bg-surface flex items-center gap-2 px-2 z-20">
      <button
        onClick={onMenuOpen}
        className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1 min-w-0 relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search artists..."
          value={query}
          onChange={handleChange}
          className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      <button
        className="text-text-secondary hover:text-text-primary transition-colors shrink-0 hidden"
        aria-label="Account"
      >
        <User size={22} />
      </button>
    </header>
  );
}
