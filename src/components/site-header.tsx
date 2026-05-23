import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createThread, loadThreads, saveThreads } from "@/lib/chat-storage";
import { useNavigate } from "@tanstack/react-router";
import bietLogo from "@/assets/biet-logo.png";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("biet-theme")) as
      | "light"
      | "dark"
      | null;
    const initial = stored ?? "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("biet-theme", next);
  };
  return { theme, toggle };
}

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleNew = () => {
    const t = createThread();
    const next = [t, ...loadThreads()];
    saveThreads(next);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-foreground text-background grid place-items-center text-[11px] font-bold tracking-tight">
            B
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Ask BIET
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNew}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New chat</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
