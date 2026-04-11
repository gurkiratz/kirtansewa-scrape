import { Search, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export function DesktopTopBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    <header className="hidden md:flex h-14 shrink-0 border-b border-border bg-surface items-center gap-4 px-5 z-20">
      <div className="flex-1 relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/70 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search artists..."
          value={query}
          onChange={handleChange}
          className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-primary/70 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      <div className="ml-auto">
        <button
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Account"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
