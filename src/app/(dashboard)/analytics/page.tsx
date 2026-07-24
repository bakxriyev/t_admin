"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Eye,
  Globe,
  MapPin,
  Calendar,
  Search,
  Users,
  TrendingUp,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import { type VisitStats, type RegionStat, type Visit } from "@/types";

type Period = "today" | "week" | "month" | "year" | "custom";

function getDateRange(period: Period): { startDate: string; endDate: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  let start: Date;
  switch (period) {
    case "today":
      return { startDate: end, endDate: end };
    case "week": {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    }
    case "month": {
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    }
    case "year": {
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      break;
    }
    default:
      return { startDate: "", endDate: "" };
  }
  return { startDate: start.toISOString().split("T")[0], endDate: end };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitsTotal, setVisitsTotal] = useState(0);
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [visitsPage, setVisitsPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAll = useCallback(
    async (start?: string, end?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (start) params.set("startDate", start);
        if (end) params.set("endDate", end);

        const qs = params.toString() ? `?${params.toString()}` : "";
        const [statsRes, regionsRes, visitsRes] = await Promise.all([
          api.get(`/api/visits/stats${qs}`),
          api.get(`/api/visits/regions${qs}`),
          api.get(`/api/visits?page=${visitsPage}&limit=15`),
        ]);
        setStats(statsRes.data);
        setRegions(regionsRes.data.regions || []);
        setVisits(visitsRes.data.data || []);
        setVisitsTotal(visitsRes.data.total || 0);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [visitsPage]
  );

  useEffect(() => {
    if (period === "custom") {
      if (customStart && customEnd) fetchAll(customStart, customEnd);
    } else if (period === "today") {
      const today = new Date().toISOString().split("T")[0];
      fetchAll(today, today);
    } else {
      const { startDate, endDate } = getDateRange(period);
      fetchAll(startDate, endDate);
    }
  }, [period, customStart, customEnd, fetchAll, visitsPage]);

  useEffect(() => {
    setVisitsPage(1);
  }, [period, customStart, customEnd]);

  const periodButtons: { key: Period; label: string }[] = [
    { key: "today", label: "Bugun" },
    { key: "week", label: "7 kun" },
    { key: "month", label: "30 kun" },
    { key: "year", label: "Yil" },
    { key: "custom", label: "Oraliq" },
  ];

  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "short",
    });
  };

  const filteredVisits = useMemo(() => {
    if (!searchTerm) return visits;
    const s = searchTerm.toLowerCase();
    return visits.filter(
      (v) =>
        v.page?.toLowerCase().includes(s) ||
        v.ip_address?.toLowerCase().includes(s) ||
        v.country?.toLowerCase().includes(s) ||
        v.city?.toLowerCase().includes(s)
    );
  }, [visits, searchTerm]);

  const totalPages = Math.ceil(visitsTotal / 15);

  if (loading && !stats) {
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-[400px] animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Analitika
          </h1>
          <p className="text-muted-foreground mt-1">
            Sayt trafigi va foydalanuvchi statistikasi
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border bg-muted/50 p-1">
          {periodButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="card-3d">
          <div className="card-3d-inner glass-card rounded-2xl p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Boshlanish sanasi
                </Label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-9 bg-background/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tugash sanasi
                </Label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-9 bg-background/50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for period change */}
      {loading && stats && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Jami tashriflar
                </p>
                <p className="text-3xl font-bold mt-1 tracking-tight">
                  {(stats?.totalVisits || 0).toLocaleString()}
                </p>
              </div>
              <div className="icon-3d rounded-xl p-2.5">
                <Eye className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Tanlangan davr</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Bugungi tashriflar
                </p>
                <p className="text-3xl font-bold mt-1 text-emerald-500 tracking-tight">
                  {(stats?.todayVisits || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MousePointerClick className="h-3 w-3" />
              <span>Bugun</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Unique IP
                </p>
                <p className="text-3xl font-bold mt-1 text-violet-500 tracking-tight">
                  {(stats?.uniqueIps || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-violet-100 dark:bg-violet-900/30">
                <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Turli IP manzillar</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Sahifalar
                </p>
                <p className="text-3xl font-bold mt-1 text-sky-500 tracking-tight">
                  {stats?.totalPages || 0}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-sky-100 dark:bg-sky-900/30">
                <Globe className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Monitor className="h-3 w-3" />
              <span>Nozik sahifalar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="icon-3d rounded-lg p-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Kunlik tashriflar
              </h3>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyStats || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDay}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    labelFormatter={(d) => formatDay(d as string)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Tashriflar"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorCount)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="unique"
                    name="Unikal"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#colorUnique)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="icon-3d rounded-lg p-1.5">
                <Monitor className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Sahifalar bo&apos;yicha
              </h3>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.pageViews || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" strokeOpacity={0.3} />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    dataKey="page"
                    type="category"
                    className="text-xs"
                    width={120}
                    tickFormatter={(v) => (v.length > 15 ? v.slice(0, 15) + ".." : v)}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                  />
                  <Bar
                    dataKey="views"
                    name="Ko'rishlar"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Regions + Visits Summary Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Regions */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="icon-3d rounded-lg p-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Hududlar bo&apos;yicha
                </h3>
              </div>
            </div>
            <div className="p-5">
              {regions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="rounded-2xl p-4 bg-muted/30 mx-auto w-fit mb-3">
                    <MapPin className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hudud ma&apos;lumotlari mavjud emas
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {regions.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/20 hover:bg-muted/20 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {r.region || "Noma'lum"}
                        </p>
                        {r.city && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {r.city}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {r.count} ta
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {r.unique} unikal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats / Summary */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="icon-3d rounded-lg p-1.5">
                <Eye className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Umumiy ma&apos;lumot
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Jami tashriflar
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {(stats?.totalVisits || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Unique IP
                </p>
                <p className="text-2xl font-bold tracking-tight text-violet-500">
                  {(stats?.uniqueIps || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Sahifalar soni
                </p>
                <p className="text-2xl font-bold tracking-tight text-sky-500">
                  {stats?.totalPages || 0}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Yozuvlar soni
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {visitsTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card rounded-2xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-3d rounded-lg p-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Tashriflar jadvali
                </h3>
              </div>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sahifa, IP yoki davlat bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card rounded-2xl overflow-hidden">
            {filteredVisits.length === 0 && !loading ? (
              <div className="p-16 text-center">
                <div className="rounded-2xl p-4 bg-muted/30 mx-auto w-fit mb-4">
                  <Eye className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {searchTerm ? "Hech narsa topilmadi" : "Tashriflar mavjud emas"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Qidiruv so'roviga mos tashrif topilmadi"
                    : "Hozircha hech qanday tashrif qayd etilmagan"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
                        #
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Sahifa
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40">
                        IP manzil
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Davlat
                        </div>
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Shahar
                        </div>
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-44">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sana
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.map((v, idx) => {
                      const globalIndex = (visitsPage - 1) * 15 + idx + 1;
                      return (
                        <tr
                          key={v.id}
                          className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {globalIndex}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-sm truncate max-w-[300px]">
                              {v.page}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <code className="text-xs bg-muted/50 rounded-md px-2 py-1 font-mono">
                              {v.ip_address || "—"}
                            </code>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm">
                              {v.country || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-muted-foreground">
                              {v.city || v.region || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(v.visited_at)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Jami{" "}
              <span className="font-medium text-foreground">
                {visitsTotal.toLocaleString()}
              </span>{" "}
              ta yozuv,{" "}
              <span className="font-medium text-foreground">{visitsPage}</span>/
              {totalPages} sahifa
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisitsPage(1)}
                disabled={visitsPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisitsPage((p) => Math.max(1, p - 1))}
                disabled={visitsPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (visitsPage <= 3) {
                  pageNum = i + 1;
                } else if (visitsPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = visitsPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === visitsPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVisitsPage(pageNum)}
                    className="h-9 w-9 p-0 font-medium"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisitsPage((p) => Math.min(totalPages, p + 1))}
                disabled={visitsPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisitsPage(totalPages)}
                disabled={visitsPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
