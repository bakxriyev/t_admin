"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tizimdagi umumiy ma'lumotlar</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Yangiliklar" value={stats.news} icon={Newspaper} description="Jami yangiliklar" />
        <StatsCard title="O'qituvchilar" value={stats.teachers} icon={Users} description="Jami o'qituvchilar" />
        <StatsCard title="Sharhlar" value={stats.reviews} icon={Star} description="Jami sharhlar" />
        <StatsCard title="Arizalar" value={stats.applications} icon={ClipboardList} description="Jami arizalar" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Oxirgi 7 kunlik arizalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentApplications}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="arizalar" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Oxirgi 7 kunlik tashriflar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitorsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
