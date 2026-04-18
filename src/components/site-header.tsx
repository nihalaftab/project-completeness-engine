import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/solution", label: "Solution" },
  { to: "/demo", label: "Live Demo" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 backdrop-blur-xl bg-background/60 border-b border-border" />
      <div className="container relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-violet to-emerald flex items-center justify-center glow-primary">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            DQS<span className="text-emerald">·</span>AI
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              activeProps={{ className: "px-3 py-1.5 rounded-md text-sm text-foreground bg-white/5" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/demo"
          className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-violet to-emerald px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity glow-primary"
        >
          Try the demo
        </Link>
      </div>
    </header>
  );
}
