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
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Newspaper,
  FileText,
  Megaphone,
  Calendar,
  TrendingUp,
  FileCheck,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { formatDate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type News } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

export default function NewsPage() {
  const router = useRouter();
  const [data, setData] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchData = async () => {
    try {
      const res = await api.get("/api/news");
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/news/${deleteId}`);
      toast.success("Yangilik o'chirildi");
      fetchData();
    } catch {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const stats = useMemo(() => {
    const total = data.length;
    const published = data.filter((n) => n.status === "published").length;
    const drafts = data.filter((n) => n.status === "draft").length;
    const totalViews = data.reduce((sum, n) => sum + (n.views || 0), 0);
    return { total, published, drafts, totalViews };
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (n) =>
          n.title_uz?.toLowerCase().includes(s) ||
          n.title_ru?.toLowerCase().includes(s) ||
          n.title_en?.toLowerCase().includes(s) ||
          n.slug?.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((n) => n.status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((n) => n.type === typeFilter);
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "views":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "title":
        result.sort((a, b) => (a.title_uz || "").localeCompare(b.title_uz || ""));
        break;
    }

    return result;
  }, [data, searchTerm, statusFilter, typeFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, sortBy]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-3.5 w-3.5" />;
      case "announcement":
        return <Megaphone className="h-3.5 w-3.5" />;
      default:
        return <Newspaper className="h-3.5 w-3.5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "article":
        return "Maqola";
      case "announcement":
        return "E'lon";
      default:
        return "Yangilik";
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "article":
        return "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";
      case "announcement":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
      default:
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Yangiliklar</h1>
          <p className="text-muted-foreground mt-1">
            Barcha yangiliklar, maqolalar va e&apos;lonlarni boshqaring
          </p>
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
          <Button onClick={() => router.push("/news/create")} className="btn-3d gap-2">
            <Plus className="h-4 w-4" />
            Yangi qo&apos;shish
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Jami yangiliklar
                </p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.total}</p>
              </div>
              <div className="icon-3d rounded-xl p-2.5">
                <Newspaper className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Barcha turdagi</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nashr qilingan
                </p>
                <p className="text-3xl font-bold mt-1 text-emerald-500 tracking-tight">
                  {stats.published}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>
                {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% nashr qilingan
              </span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Qoralama
                </p>
                <p className="text-3xl font-bold mt-1 text-amber-500 tracking-tight">{stats.drafts}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-amber-100 dark:bg-amber-900/30">
                <FileEdit className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Tahrirlash kutilmoqda</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ko&apos;rishlar
                </p>
                <p className="text-3xl font-bold mt-1 text-sky-500 tracking-tight">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-sky-100 dark:bg-sky-900/30">
                <Eye className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Jami ko&apos;rishlar soni</span>
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
                placeholder="Sarlavha yoki slug bo&apos;yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="published">Nashr qilingan</SelectItem>
                  <SelectItem value="draft">Qoralama</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue placeholder="Tur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="news">Yangilik</SelectItem>
                  <SelectItem value="article">Maqola</SelectItem>
                  <SelectItem value="announcement">E&apos;lon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Saralash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Eng yangi</SelectItem>
                  <SelectItem value="oldest">Eng eski</SelectItem>
                  <SelectItem value="views">Ko&apos;rishlar</SelectItem>
                  <SelectItem value="title">Sarlavha</SelectItem>
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
                  <Newspaper className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos yangilik yo&apos;q
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((item, idx) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <div key={item.id} className="card-3d group">
                    <div className="card-3d-inner glass-card card-shine rounded-2xl overflow-hidden flex flex-col h-full">
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden bg-muted">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title_uz}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {/* Number Badge */}
                        <div className="absolute top-3 left-3 icon-3d rounded-lg px-2.5 py-1 text-xs font-bold text-primary-foreground">
                          #{globalIndex}
                        </div>
                        {/* Type & Status Badges */}
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <Badge className={`text-[10px] px-2 py-0.5 gap-1 ${getTypeBadgeClass(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                        {/* Bottom overlay info */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-white/90 text-xs">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.created_at)}
                          </div>
                          <div className="flex items-center gap-1 text-white/90 text-xs">
                            <Eye className="h-3 w-3" />
                            {(item.views || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <Link
                          href={`/news/${item.id}`}
                          className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors mb-3"
                        >
                          {item.title_uz || item.title_ru || item.title_en}
                        </Link>

                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                          <Badge
                            className={`text-[10px] ${
                              item.status === "published"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {item.status === "published" ? "Nashr qilingan" : "Qoralama"}
                          </Badge>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10"
                              onClick={() => router.push(`/news/${item.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10"
                              onClick={() => router.push(`/news/${item.id}/edit`)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
                  <Newspaper className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos yangilik yo&apos;q
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
                        Yangilik
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        Tur
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                        Holat
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Ko&apos;rish
                        </div>
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
                          {/* Yangilik */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                <img
                                  src={getImageUrl(item.image)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/news/${item.id}`}
                                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                                >
                                  {item.title_uz || item.title_ru || item.title_en}
                                </Link>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  /{item.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Tur */}
                          <td className="px-5 py-3.5">
                            <Badge className={`text-[10px] gap-1 ${getTypeBadgeClass(item.type)}`}>
                              {getTypeIcon(item.type)}
                              {getTypeLabel(item.type)}
                            </Badge>
                          </td>
                          {/* Holat */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  item.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              <span className="text-sm">
                                {item.status === "published" ? "Nashr qilingan" : "Qoralama"}
                              </span>
                            </div>
                          </td>
                          {/* Ko'rish */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium">
                              {(item.views || 0).toLocaleString()}
                            </span>
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
                                onClick={() => router.push(`/news/${item.id}`)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10"
                                onClick={() => router.push(`/news/${item.id}/edit`)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteId(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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

      <DeleteConfirmModal
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
