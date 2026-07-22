"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Users, Eye, Globe, MapPin, Calendar, ChevronDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
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
      start = new Date(now); start.setDate(now.getDate() - 7); break;
    }
    case "month": {
      start = new Date(now); start.setMonth(now.getMonth() - 1); break;
    }
    case "year": {
      start = new Date(now); start.setFullYear(now.getFullYear() - 1); break;
    }
    default: return { startDate: "", endDate: "" };
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
  const [showFilters, setShowFilters] = useState(false);
  const [visitsPage, setVisitsPage] = useState(1);

  const fetchAll = useCallback(async (start?: string, end?: string) => {
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
    } catch {}
    finally { setLoading(false); }
  }, [visitsPage]);

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
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDay = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("uz-UZ", {
      day: "numeric", month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitika</h1>
          <p className="text-muted-foreground mt-1">Sayt trafigi va foydalanuvchi statistikasi</p>
        </div>
        <div className="flex items-center gap-2">
          {periodButtons.map(({ key, label }) => (
            <Button
              key={key}
              variant={period === key ? "default" : "outline"}
              size="sm"
              onClick={() => { setPeriod(key); if (key !== "custom") setShowFilters(false); }}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {period === "custom" && (
        <div className="flex items-end gap-3 p-4 rounded-xl border bg-card">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Boshlanish</Label>
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tugash</Label>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-9" />
          </div>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Jami tashriflar</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVisits?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Tanlangan davr</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unikal tashriflar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.uniqueIps?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Turli IP manzillar</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bugungi tashriflar</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayVisits?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Bugun</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sahifalar</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Nozik sahifalar</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Kunlik tashriflar</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.dailyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tickFormatter={formatDay} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip labelFormatter={(d) => formatDay(d)} />
                      <Area type="monotone" dataKey="count" name="Tashriflar" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                      <Area type="monotone" dataKey="unique" name="Unikal" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary) / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sahifalar bo'yicha</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.pageViews || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="page" type="category" className="text-xs" width={120} tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + ".." : v} />
                      <Tooltip />
                      <Bar dataKey="views" name="Ko'rishlar" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Hududlar bo'yicha
                </CardTitle>
              </CardHeader>
              <CardContent>
                {regions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Hudud ma'lumotlari mavjud emas
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {regions.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{r.region || "Noma'lum"}</p>
                          {r.city && <p className="text-xs text-muted-foreground truncate">{r.city}</p>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <Badge variant="secondary" className="text-xs">{r.count} ta</Badge>
                          <span className="text-xs text-muted-foreground">{r.unique} unikal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Oxirgi tashriflar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tashriflar mavjud emas
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {visits.map((v) => (
                      <div key={v.id} className="flex items-start justify-between p-2.5 rounded-lg border text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{v.page}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {v.city || v.region || v.country || "Noma'lum joy"}
                            {v.ip_address && ` • ${v.ip_address}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatDate(v.visited_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {visitsTotal > 15 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline" size="sm"
                      disabled={visitsPage <= 1}
                      onClick={() => setVisitsPage((p) => Math.max(1, p - 1))}
                    >
                      Oldingi
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {visitsPage} / {Math.ceil(visitsTotal / 15)}
                    </span>
                    <Button
                      variant="outline" size="sm"
                      disabled={visitsPage >= Math.ceil(visitsTotal / 15)}
                      onClick={() => setVisitsPage((p) => p + 1)}
                    >
                      Keyingi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
