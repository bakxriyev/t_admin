"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebarTrigger } from "./Sidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { Moon, Sun, Search, Bell } from "lucide-react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [admin, setAdmin] = useState<{
    name?: string;
    full_name?: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("admin");
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {}
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 md:ml-64">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8">
        <MobileSidebarTrigger />

        <div className="flex-1 flex items-center gap-4">
          <div className="relative hidden md:flex items-center flex-1 max-w-md">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder={t("search.placeholder")}
              className="pl-10 h-9 rounded-xl border-border/50 bg-muted/40 focus-visible:bg-background transition-all duration-300 focus-visible:shadow-[0_0_0_2px_hsl(var(--primary)/0.12),0_4px_16px_hsl(var(--primary)/0.08)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-accent/50 transition-all duration-300"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              3
            </span>
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-accent/50 transition-all duration-300"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </Button>
          )}

          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border/50">
            <Avatar className="h-8 w-8 ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all duration-300 hover:ring-primary/30">
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                {(admin?.name || admin?.full_name || "A")?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            {mounted && (
              <div className="hidden md:block leading-tight">
                <p className="text-sm font-medium">
                  {admin?.name || admin?.full_name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {admin?.email || ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
