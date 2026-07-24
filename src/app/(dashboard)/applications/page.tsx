"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Pencil,
  User,
  Phone,
  Mail,
  BookOpen,
  TrendingUp,
  UserPlus,
  PhoneCall,
  UserCheck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { applicationStatusOptions } from "@/lib/constants";
import api from "@/lib/api";
import { type CourseApplication } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

const statusMap: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  new: {
    label: "Yangi",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: <UserPlus className="h-3.5 w-3.5" />,
  },
  contacted: {
    label: "Aloqaga chiqilgan",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: <PhoneCall className="h-3.5 w-3.5" />,
  },
  registered: {
    label: "Ro'yxatdan o'tgan",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: <UserCheck className="h-3.5 w-3.5" />,
  },
  closed: {
    label: "Yopilgan",
    badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [data, setData] = useState<CourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/courses");
      setData(res.data.data || []);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    setStatusUpdating(id);
    try {
      await api.put(`/api/courses/${id}`, { status });
      toast.success("Holat yangilandi");
      fetchData();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setStatusUpdating(null);
    }
  };

  const stats = useMemo(() => {
    const total = data.length;
    const news = data.filter((a) => a.status === "new").length;
    const contacted = data.filter((a) => a.status === "contacted").length;
    const registered = data.filter((a) => a.status === "registered").length;
    return { total, news, contacted, registered };
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(s) ||
          a.phone?.toLowerCase().includes(s) ||
          a.course_name?.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "name":
        result.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
        break;
    }

    return result;
  }, [data, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const getStatusDot = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "contacted":
        return "bg-purple-500";
      case "registered":
        return "bg-emerald-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Arizalar</h1>
          <p className="text-muted-foreground mt-1">Kurslarga arizalar ro&apos;yxati</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border bg-muted/50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="0.5" y="0.5" width="5" height="5" rx="1" stroke="currentColor" />
                  <rect x="8.5" y="0.5" width="5" height="5" rx="1" stroke="currentColor" />
                  <rect x="0.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" />
                  <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" />
                </svg>
                Kartochka
              </div>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="0.5" y="0.5" width="13" height="3" rx="1" stroke="currentColor" />
                  <rect x="0.5" y="5.5" width="13" height="3" rx="1" stroke="currentColor" />
                  <rect x="0.5" y="10.5" width="13" height="3" rx="1" stroke="currentColor" />
                </svg>
                Jadval
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Jami arizalar
                </p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.total}</p>
              </div>
              <div className="icon-3d rounded-xl p-2.5">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Barcha arizalar</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Yangi
                </p>
                <p className="text-3xl font-bold mt-1 text-blue-500 tracking-tight">{stats.news}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-blue-100 dark:bg-blue-900/30">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>
                {stats.total > 0 ? Math.round((stats.news / stats.total) * 100) : 0}% yangi
              </span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Aloqaga chiqilgan
                </p>
                <p className="text-3xl font-bold mt-1 text-purple-500 tracking-tight">
                  {stats.contacted}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-purple-100 dark:bg-purple-900/30">
                <PhoneCall className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Aloqa qilinganlar</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ro&apos;yxatdan o&apos;tgan
                </p>
                <p className="text-3xl font-bold mt-1 text-emerald-500 tracking-tight">
                  {stats.registered}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>
                {stats.total > 0 ? Math.round((stats.registered / stats.total) * 100) : 0}% ro&apos;yxatdan o&apos;tgan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card-3d">
        <div className="card-3d-inner glass-card rounded-2xl p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ism, telefon yoki kurs bo&apos;yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="new">Yangi</SelectItem>
                  <SelectItem value="contacted">Aloqaga chiqilgan</SelectItem>
                  <SelectItem value="registered">Ro&apos;yxatdan o&apos;tgan</SelectItem>
                  <SelectItem value="closed">Yopilgan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Saralash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Eng yangi</SelectItem>
                  <SelectItem value="oldest">Eng eski</SelectItem>
                  <SelectItem value="name">Ism</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          {paginated.length === 0 ? (
            <div className="card-3d">
              <div className="card-3d-inner glass-card rounded-2xl p-16 text-center">
                <div className="icon-3d rounded-2xl p-4 mx-auto w-fit mb-4">
                  <FileText className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos ariza yo&apos;q
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((item, idx) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const status = statusMap[item.status] || statusMap.new;
                const firstLetter = (item.full_name || "A")[0].toUpperCase();
                return (
                  <div key={item.id} className="card-3d group">
                    <div className="card-3d-inner glass-card card-shine rounded-2xl overflow-hidden flex flex-col h-full">
                      {/* Top colored bar visual */}
                      <div className="h-2 bg-gradient-to-r from-primary/60 to-primary" />
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Avatar + Info Row */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-lg font-bold text-primary">
                              {firstLetter}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/applications/${item.id}`}
                              className="font-semibold text-sm leading-snug line-clamp-1 hover:text-primary transition-colors"
                            >
                              {item.full_name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                className={`text-[10px] px-1.5 py-0.5 gap-1 ${status.badgeClass}`}
                              >
                                {status.icon}
                                {status.label}
                              </Badge>
                            </div>
                          </div>
                          <span className="icon-3d rounded-lg px-2 py-0.5 text-[10px] font-bold text-primary-foreground shrink-0">
                            #{globalIndex}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4 flex-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate font-medium text-foreground/80">
                              {item.course_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <Select
                            value={item.status}
                            onValueChange={(v) => handleStatusChange(item.id, v)}
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {applicationStatusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={() => router.push(`/applications/${item.id}`)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="card-3d">
          <div className="card-3d-inner glass-card rounded-2xl overflow-hidden">
            {paginated.length === 0 ? (
              <div className="p-16 text-center">
                <div className="icon-3d rounded-2xl p-4 mx-auto w-fit mb-4">
                  <FileText className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos ariza yo&apos;q
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
                        Ism
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Kurs
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">
                        Holat
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sana
                        </div>
                      </th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => {
                      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                      const status = statusMap[item.status] || statusMap.new;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          {/* # */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {globalIndex}
                            </span>
                          </td>
                          {/* Ism */}
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/applications/${item.id}`}
                              className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.full_name}
                            </Link>
                          </td>
                          {/* Telefon */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />
                              {item.phone}
                            </div>
                          </td>
                          {/* Kurs */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium">{item.course_name}</span>
                          </td>
                          {/* Holat */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${getStatusDot(item.status)}`}
                              />
                              <Select
                                value={item.status}
                                onValueChange={(v) => handleStatusChange(item.id, v)}
                              >
                                <SelectTrigger className="h-7 w-[140px] text-xs bg-background/50 border-0 shadow-none">
                                  <SelectValue>
                                    <Badge
                                      className={`text-[10px] px-1.5 py-0.5 gap-1 ${status.badgeClass}`}
                                    >
                                      {status.icon}
                                      {status.label}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {applicationStatusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                          {/* Sana */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(item.created_at)}
                            </span>
                          </td>
                          {/* Amallar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10"
                                onClick={() => router.push(`/applications/${item.id}`)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Select
                                value={item.status}
                                onValueChange={(v) => handleStatusChange(item.id, v)}
                              >
                                <SelectTrigger className="h-8 w-8 border-0 shadow-none bg-transparent hover:bg-primary/10 rounded-lg p-0 flex items-center justify-center [&>svg]:hidden">
                                  <Pencil className="h-3.5 w-3.5" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  {applicationStatusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jami <span className="font-medium text-foreground">{filtered.length}</span> ta yozuv,{" "}
            <span className="font-medium text-foreground">{currentPage}</span>/
            {totalPages} sahifa
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-9 w-9 p-0 font-medium"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
