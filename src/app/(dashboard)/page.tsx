"use client";

import { useState, useEffect } from "react";
import {
  Newspaper,
  Users,
  Star,
  ClipboardList,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "@/lib/api";

const recentApplications = [
  { name: "Du", arizalar: 4 },
  { name: "Se", arizalar: 7 },
  { name: "Ch", arizalar: 5 },
  { name: "Pa", arizalar: 9 },
  { name: "Ju", arizalar: 6 },
  { name: "Sh", arizalar: 11 },
  { name: "Ya", arizalar: 8 },
];

const visitorsData = [
  { name: "Du", visitors: 120 },
  { name: "Se", visitors: 200 },
  { name: "Ch", visitors: 150 },
  { name: "Pa", visitors: 280 },
  { name: "Ju", visitors: 190 },
  { name: "Sh", visitors: 310 },
  { name: "Ya", visitors: 250 },
];

const statCards = [
  { key: "news", label: "Yangiliklar", icon: Newspaper, color: "sky" },
  { key: "teachers", label: "O'qituvchilar", icon: Users, color: "violet" },
  { key: "reviews", label: "Sharhlar", icon: Star, color: "amber" },
  { key: "applications", label: "Arizalar", icon: ClipboardList, color: "emerald" },
] as const;

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  sky: {
    bg: "bg-sky-100 dark:bg-sky-900/30",
    iconBg: "bg-sky-100 dark:bg-sky-900/30",
    text: "text-sky-500",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-500",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-500",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-500",
  },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function Skeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-3d">
            <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-muted" />
                </div>
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              </div>
              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted-foreground/20" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card-3d">
            <div className="card-3d-inner glass-card rounded-2xl p-5">
              <div className="h-6 w-52 animate-pulse rounded-lg bg-muted mb-4" />
              <div className="h-[300px] animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    news: 0,
    teachers: 0,
    reviews: 0,
    applications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [newsRes, teachersRes, reviewsRes, appsRes] = await Promise.all([
          api.get("/api/news"),
          api.get("/api/teachers"),
          api.get("/api/reviews"),
          api.get("/api/courses"),
        ]);
        setStats({
          news: newsRes.data.total || newsRes.data.data?.length || 0,
          teachers: teachersRes.data.total || teachersRes.data.data?.length || 0,
          reviews: reviewsRes.data.total || reviewsRes.data.data?.length || 0,
          applications: appsRes.data.total || appsRes.data.data?.length || 0,
        });
      } catch {
        setStats({ news: 0, teachers: 0, reviews: 0, applications: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Tizimdagi umumiy ma&apos;lumotlar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color }) => {
          const c = colorMap[color];
          const value = stats[key as keyof typeof stats];
          return (
            <div key={key} className="card-3d group">
              <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {label}
                    </p>
                    <p className={`text-3xl font-bold mt-1 tracking-tight ${c.text}`}>
                      {formatNumber(value)}
                    </p>
                  </div>
                  <div className={`icon-3d rounded-xl p-2.5 ${c.bg} [background:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.7))] [box-shadow:0_4px_16px_hsl(var(--primary)/0.25)]`}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Jami {label.toLowerCase()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="icon-3d rounded-lg p-1.5">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                Oxirgi 7 kunlik arizalar
              </h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentApplications}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      boxShadow: "0 8px 32px hsl(0 0% 0% / 0.12)",
                    }}
                  />
                  <Bar dataKey="arizalar" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="icon-3d rounded-lg p-1.5">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                Oxirgi 7 kunlik tashriflar
              </h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitorsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      boxShadow: "0 8px 32px hsl(0 0% 0% / 0.12)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                    activeDot={{ r: 7, fill: "hsl(var(--primary))", strokeWidth: 3, stroke: "hsl(var(--card))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
