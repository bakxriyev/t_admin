"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  Video,
  FileText,
  MessageSquareQuote,
  MessageSquareText,
  Film,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Eye,
} from "lucide-react";
import { formatDate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type Testimonial } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

export default function TestimonialsPage() {
  const router = useRouter();
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchData = async () => {
    try {
      const res = await api.get("/api/testimonials");
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
      await api.delete(`/api/testimonials/${deleteId}`);
      toast.success("Fikr o'chirildi");
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
    const textCount = data.filter((t) => t.type === "text").length;
    const videoCount = data.filter((t) => t.type === "video").length;
    const activeCount = data.filter((t) => t.is_active).length;
    return { total, textCount, videoCount, activeCount };
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name_uz?.toLowerCase().includes(s) ||
          t.name_ru?.toLowerCase().includes(s) ||
          t.name_en?.toLowerCase().includes(s)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((t) => t.is_active);
      } else if (statusFilter === "inactive") {
        result = result.filter((t) => !t.is_active);
      }
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "order":
        result.sort((a, b) => (a.order || 0) - (b.order || 0));
        break;
    }

    return result;
  }, [data, searchTerm, typeFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, sortBy]);

  const getTypeIcon = (type: string) => {
    return type === "video" ? (
      <Video className="h-3.5 w-3.5" />
    ) : (
      <FileText className="h-3.5 w-3.5" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type === "video" ? "Video" : "Matn";
  };

  const getTypeBadgeClass = (type: string) => {
    return type === "video"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-48 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
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
          <h1 className="text-3xl font-bold tracking-tight gradient-text">O&apos;quvchilar Fikrlari</h1>
          <p className="text-muted-foreground mt-1">
            Barcha fikr va video tavsiyalar
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
          <Button onClick={() => router.push("/testimonials/create")} className="btn-3d gap-2">
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
                  Jami fikrlar
                </p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.total}</p>
              </div>
              <div className="icon-3d rounded-xl p-2.5">
                <MessageSquareQuote className="h-5 w-5 text-primary-foreground" />
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
                  Matnli
                </p>
                <p className="text-3xl font-bold mt-1 text-blue-500 tracking-tight">
                  {stats.textCount}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-blue-100 dark:bg-blue-900/30">
                <MessageSquareText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>
                {stats.total > 0 ? Math.round((stats.textCount / stats.total) * 100) : 0}% matnli fikrlar
              </span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Videoli
                </p>
                <p className="text-3xl font-bold mt-1 text-purple-500 tracking-tight">
                  {stats.videoCount}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-purple-100 dark:bg-purple-900/30">
                <Film className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>
                {stats.total > 0 ? Math.round((stats.videoCount / stats.total) * 100) : 0}% videoli fikrlar
              </span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Faol
                </p>
                <p className="text-3xl font-bold mt-1 text-emerald-500 tracking-tight">
                  {stats.activeCount}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>
                {stats.total > 0 ? Math.round((stats.activeCount / stats.total) * 100) : 0}% faol
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
                placeholder="Ism bo&apos;yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue placeholder="Tur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="text">Matn</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="inactive">No faol</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Saralash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Eng yangi</SelectItem>
                  <SelectItem value="oldest">Eng eski</SelectItem>
                  <SelectItem value="order">Tartib</SelectItem>
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
                  <MessageSquareQuote className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos fikr yo&apos;q
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
                      {/* Top accent bar */}
                      <div className={item.type === "video" ? "bg-purple-500 h-1.5" : "bg-blue-500 h-1.5"} />

                      <div className="p-5 flex-1 flex flex-col items-center text-center">
                        {/* Round Avatar */}
                        <div className="relative mb-4">
                          <div className="h-20 w-20 rounded-full overflow-hidden bg-muted ring-4 ring-background">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name_uz}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {/* Number Badge */}
                          <div className="absolute -bottom-1 -right-1 icon-3d rounded-lg px-2 py-0.5 text-xs font-bold text-primary-foreground">
                            #{globalIndex}
                          </div>
                        </div>

                        {/* Name & Position */}
                        <h3 className="font-semibold text-sm leading-snug">
                          {item.name_uz || item.name_ru || item.name_en}
                        </h3>
                        {item.position_uz && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {item.position_uz}
                          </p>
                        )}

                        {/* Type & Status Badges */}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={`text-[10px] px-2 py-0.5 gap-1 ${getTypeBadgeClass(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {getTypeLabel(item.type)}
                          </Badge>
                          <Badge
                            className={`text-[10px] px-2 py-0.5 ${
                              item.is_active
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                            }`}
                          >
                            {item.is_active ? "Faol" : "No faol"}
                          </Badge>
                        </div>

                        {/* Order */}
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <ArrowUpDown className="h-3 w-3" />
                          <span>Tartib: {item.order}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 w-full flex items-center justify-center gap-1 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={() => router.push(`/testimonials/${item.id}/edit`)}
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
                  <MessageSquareQuote className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos fikr yo&apos;q
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
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                        Rasm
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Ism
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Lavozim
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        Tur
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                        Holat
                      </th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                        Tartib
                      </th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
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
                          {/* Rasm */}
                          <td className="px-5 py-3.5">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted ring-2 ring-border/50">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name_uz}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>
                          {/* Ism */}
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-sm">
                              {item.name_uz || item.name_ru || item.name_en}
                            </span>
                          </td>
                          {/* Lavozim */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-muted-foreground">
                              {item.position_uz || "—"}
                            </span>
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
                                  item.is_active ? "bg-emerald-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="text-sm">
                                {item.is_active ? "Faol" : "No faol"}
                              </span>
                            </div>
                          </td>
                          {/* Tartib */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium text-center block">
                              {item.order}
                            </span>
                          </td>
                          {/* Amallar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10"
                                onClick={() => router.push(`/testimonials/${item.id}/edit`)}
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
