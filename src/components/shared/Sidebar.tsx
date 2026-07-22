"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn, getImageUrl } from "@/lib/utils";
import { navigationItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/providers/LanguageProvider";
import { LogOut, Menu, Scale } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import api from "@/lib/api";

interface SidebarContextType {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileOpen } = useSidebar();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get("/api/settings")
      .then((res) => { const d = res.data.data || res.data; setSettings(d); })
      .catch(() => {});
  }, []);

  const siteName = settings
    ? (settings as any)[`site_name_${lang}`] || settings.site_name_en || "TLS Admin"
    : "TLS Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/login");
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      <div className="flex items-center gap-3 px-6 py-7">
        {settings?.logo ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/10">
            <Image src={getImageUrl(settings.logo)} alt="Logo" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 ring-1 ring-white/10">
            <Scale className="h-5 w-5 text-white" />
          </div>
        )}
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {siteName}
          </span>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
            Control Panel
          </p>
        </div>
      </div>
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
      <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");
          const navKey =
            item.href === "/"
              ? "dashboard"
              : item.href.replace("/", "").replace(/-/g, "");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white shadow-lg shadow-violet-500/10"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-full bg-gradient-to-b from-violet-400 to-indigo-500 shadow-lg shadow-violet-400/50" />
              )}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-violet-600/30 text-violet-300"
                    : "text-slate-400 group-hover:bg-white/[0.08] group-hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span className="truncate">{t(`nav.${navKey}`)}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
      <div className="p-4 space-y-3">
        <div className="flex justify-center">
          <div className="[&_button]:border-slate-700 [&_button]:text-slate-300 [&_button]:bg-white/5">
            <LanguageSwitcher />
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-300 h-11"
          onClick={handleLogout}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
            <LogOut className="h-4 w-4" />
          </div>
          <span>{t("nav.logout")}</span>
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebarTrigger() {
  const { setMobileOpen } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden h-9 w-9 rounded-xl"
      onClick={() => setMobileOpen(true)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export function Sidebar() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { mobileOpen, setMobileOpen } = useSidebar();

  if (isMobile === undefined) return null;

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 border-r-0">
          <SidebarNav />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col fixed left-0 top-0 h-full z-40 shadow-2xl shadow-black/20">
      <SidebarNav />
    </aside>
  );
}
