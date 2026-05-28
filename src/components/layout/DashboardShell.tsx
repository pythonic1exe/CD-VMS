import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn, initials } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ReactNode;
  count?: number;
};

type DashboardShellProps = {
  title: string;
  subtitle: string;
  roleLabel: string;
  profileName: string;
  sidebarItems: SidebarItem[];
  children: ReactNode;
  actions?: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  roleLabel,
  profileName,
  sidebarItems,
  children,
  actions
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } finally {
      setSigningOut(false);
      setMobileOpen(false);
    }
  }

  function isItemActive(href: string) {
    const current = `${location.pathname}${location.search}`;

    if (href.includes("?")) {
      return current === href;
    }

    return location.pathname === href && location.search === "";
  }

  const sidebar = (
    <aside className="flex h-full w-[268px] flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <BrandLogo textClassName="text-white" markClassName="bg-white text-primary" />
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-4 py-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-white/50">{roleLabel}</p>
          <p className="mt-1 text-sm font-semibold text-white">{profileName}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-white/68 transition-colors hover:bg-white/10 hover:text-white",
              isItemActive(item.href) && "bg-white text-sidebar hover:bg-white hover:text-sidebar"
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-5 w-5 place-items-center">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </span>
            {item.count ? (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">{item.count}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Button
          variant="ghost"
          className="mb-2 w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => void handleSignOut()}
          loading={signingOut}
        >
          {!signingOut ? <LogOut className="h-4 w-4" /> : null}
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>
        <Link to="/" className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          Back to website
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden fixed inset-y-0 left-0 z-40 lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div onClick={(event) => event.stopPropagation()}>{sidebar}</div>
        </div>
      ) : null}
      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-30 border-b border-border bg-white/88 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-auto flex items-center gap-2">
              {actions}
              <Button variant="outline" onClick={() => void handleSignOut()} loading={signingOut} className="hidden sm:inline-flex">
                {!signingOut ? <LogOut className="h-4 w-4" /> : null}
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials(profileName)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{roleLabel}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
