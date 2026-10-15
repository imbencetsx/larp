"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowUpRight,
  ChevronRight,
  Menu as MenuIcon,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Kbd } from "~/components/ui/kbd";
import { Alert, AlertDescription, AlertAction } from "~/components/ui/alert";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
} from "~/components/ui/dialog";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuLinkItem,
  MenuSeparator,
} from "~/components/ui/menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipPopup,
} from "~/components/ui/tooltip";
import { useLearning } from "./learning-provider";
import { tracks, lessons } from "~/content/curriculum";
import { cn } from "~/lib/utils";
const nav = [
  { href: "/courses", label: "Learn" },
  { href: "/playground", label: "Playground" },
  { href: "/garden", label: "Garden" },
  { href: "/progress", label: "Progress" },
];
function ClerkAccount() {
  const { user } = useUser();
  return user ? (
    <UserButton />
  ) : (
    <Button render={<Link href="/sign-in" />} variant="outline">
      Sign in <ArrowUpRight />
    </Button>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, error, refresh, authEnabled } = useLearning();
  const [search, setSearch] = useState(false);
  const [term, setTerm] = useState("");
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const active = (href: string) =>
    href === "/courses"
      ? pathname === "/" ||
        pathname.startsWith("/courses") ||
        pathname.startsWith("/learn")
      : pathname === href;
  const matches = lessons.filter((l) =>
    `${l.title} ${l.track}`.toLowerCase().includes(term.toLowerCase()),
  );
  return (
    <TooltipProvider>
      <div
        className={cn(
          "app-shell isolate",
          pathname.startsWith("/learn") && "lesson-shell",
          pathname === "/playground" && "playground-shell",
        )}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand" aria-label="LARP home">
              <span className="wordmark">LARP</span>
              <span className="logo-pixel" />
            </Link>
            <nav className="desktop-nav" aria-label="Main navigation">
              {nav.map((n) => (
                <Button
                  key={n.href}
                  size="lg"
                  variant={active(n.href) ? "secondary" : "ghost"}
                  render={<Link href={n.href} />}
                  aria-current={active(n.href) ? "page" : undefined}
                  className="topnav-link"
                >
                  {n.label}
                </Button>
              ))}
            </nav>
            <div className="topbar-actions">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="search-button"
                      aria-label="Find a lesson"
                      onClick={() => setSearch(true)}
                    />
                  }
                >
                  <Search aria-hidden="true" />
                </TooltipTrigger>
                <TooltipPopup>
                  Search lessons <Kbd>⌘ K</Kbd>
                </TooltipPopup>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="settings-link"
                      aria-label="Settings"
                      render={<Link href="/settings" />}
                    />
                  }
                >
                  <Settings aria-hidden="true" />
                </TooltipTrigger>
                <TooltipPopup>Settings</TooltipPopup>
              </Tooltip>
              {authEnabled ? (
                <ClerkAccount />
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  render={<Link href="/settings" />}
                  className="guest-avatar"
                  aria-label="Guest profile"
                >
                  {data?.profile.name[0]?.toUpperCase() ?? "L"}
                </Button>
              )}
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      className="mobile-menu"
                      variant="ghost"
                      size="icon"
                      aria-label="Open navigation"
                    />
                  }
                >
                  <MenuIcon aria-hidden="true" />
                </MenuTrigger>
                <MenuPopup align="end" className="mobile-nav-popup">
                  <MenuLinkItem render={<Link href="/" />}>
                    Overview
                  </MenuLinkItem>
                  {nav.map((n) => (
                    <MenuLinkItem key={n.href} render={<Link href={n.href} />}>
                      {n.href === "/courses" ? "Learning paths" : n.label}
                    </MenuLinkItem>
                  ))}
                  <MenuSeparator />
                  <MenuLinkItem render={<Link href="/settings" />}>
                    Settings
                  </MenuLinkItem>
                </MenuPopup>
              </Menu>
            </div>
          </div>
        </header>
        {error && (
          <Alert variant="error" className="error-banner">
            <AlertDescription>
              Could not load progress. {error}
            </AlertDescription>
            <AlertAction>
              <Button variant="outline" onClick={() => void refresh()}>
                Retry
              </Button>
            </AlertAction>
          </Alert>
        )}
        <main
          id="main-content"
          className={cn(
            "main-content",
            pathname.startsWith("/learn") && "workspace-main",
            pathname === "/playground" && "playground-main",
          )}
        >
          {children}
        </main>
        <footer className="page-footer">
          <span>
            LARP <span className="footer-dot">/</span> LEARN. BUILD. REPEAT.
          </span>
          <Link href="/welcome">
            About <ArrowUpRight aria-hidden="true" />
          </Link>
        </footer>
        <Dialog open={search} onOpenChange={setSearch}>
          <DialogPopup className="search-dialog">
            <DialogHeader>
              <DialogTitle>Find a lesson</DialogTitle>
              <DialogDescription>
                Search by topic or language.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <Input
                aria-label="Search lessons"
                placeholder="Search lessons…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <div className="search-results">
                {matches.map((l) => (
                  <Button
                    variant="ghost"
                    className="search-result"
                    key={l.id}
                    render={<Link href={`/learn/${l.track}/${l.number}`} />}
                    onClick={() => {
                      setSearch(false);
                      setTerm("");
                    }}
                  >
                    <span
                      className={`mini-track ${tracks.find((t) => t.id === l.track)?.color}`}
                    >
                      {tracks.find((t) => t.id === l.track)?.short}
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      <small>
                        {tracks.find((t) => t.id === l.track)?.name} /{" "}
                        {String(l.number).padStart(2, "0")}
                      </small>
                    </span>
                    <ChevronRight />
                  </Button>
                ))}
                {!matches.length && (
                  <p className="empty-search">No lessons found.</p>
                )}
              </div>
            </DialogPanel>
          </DialogPopup>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
