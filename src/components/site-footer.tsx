import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Bapuji Institute of Engineering & Technology · Built with{" "}
          <span className="text-gradient-brand font-medium">Ask BIET</span>
        </p>
        <div className="flex gap-5">
          <Link to="/about" className="hover:text-foreground transition">About</Link>
          <Link to="/contact" className="hover:text-foreground transition">Contact</Link>
          <Link to="/chat" className="hover:text-foreground transition">Chat</Link>
        </div>
      </div>
    </footer>
  );
}
