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
  Play,
  Search,
  Video,
  MonitorPlay,
  UserCheck,
  UserX,
  ArrowUpDown,
  Tag,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { truncate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

export default function VideoReviewsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchData = async () => {
    try {
      const res = await api.get("/api/video-reviews");
      setData(res.data.data || []);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/video-reviews/${deleteId}`);
      toast.success("Video sharh o'chirildi");
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
    const active = data.filter((v) => v.is_active).length;
    const inactive = data.filter((v) => !v.is_active).length;
    const avgOrder =
      total > 0
        ? Math.round(
            (data.reduce((sum, v) => sum + (v.order || 0), 0) / total) * 10
          ) / 10
        : 0;
    return { total, active, inactive, avgOrder };
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.name_uz?.toLowerCase().includes(s) ||
          v.name_ru?.toLowerCase().includes(s) ||
          v.name_en?.toLowerCase().includes(s)
      );
    }

    if (statusFilter === "active") {
      result = result.filter((v) => v.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((v) => !v.is_active);
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "order":
        result.sort((a, b) => (a.order || 0) - (b.order || 0));
        break;
      case "name":
        result.sort((a, b) =>
          (a.name_uz || "").localeCompare(b.name_uz || "")
        );
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

  const handlePlayVideo = (videoUrl?: string) => {
    if (videoUrl) {
      window.open(getImageUrl(videoUrl), "_blank");
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
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Video Sharhlar
          </h1>
          <p className="text-muted-foreground mt-1">
            Talabalar video sharhlari
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
                  <rect
                    x="0.5"
                    y="0.5"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                  />
                  <rect
                    x="8.5"
                    y="0.5"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                  />
                  <rect
                    x="0.5"
                    y="8.5"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                  />
                  <rect
                    x="8.5"
                    y="8.5"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                  />
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
                  <rect
                    x="0.5"
                    y="0.5"
                    width="13"
                    height="3"
                    rx="1"
                    stroke="currentColor"
                  />
                  <rect
                    x="0.5"
                    y="5.5"
                    width="13"
                    height="3"
                    rx="1"
                    stroke="currentColor"
                  />
                  <rect
                    x="0.5"
                    y="10.5"
                    width="13"
                    height="3"
                    rx="1"
                    stroke="currentColor"
                  />
                </svg>
                Jadval
              </div>
            </button>
          </div>
          <Button
            onClick={() => router.push("/video-reviews/create")}
            className="btn-3d gap-2"
          >
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
                  Jami video sharhlar
                </p>
                <p className="text-3xl font-bold mt-1 tracking-tight">
                  {stats.total}
                </p>
              </div>
              <div className="icon-3d rounded-xl p-2.5">
                <Video className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Barcha videolar</span>
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
                  {stats.active}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>
                {stats.total > 0
                  ? Math.round((stats.active / stats.total) * 100)
                  : 0}
                % faol
              </span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  No faol
                </p>
                <p className="text-3xl font-bold mt-1 text-rose-500 tracking-tight">
                  {stats.inactive}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-rose-100 dark:bg-rose-900/30">
                <UserX className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Ko&apos;rinmaydi</span>
            </div>
          </div>
        </div>

        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  O&apos;rtacha tartib
                </p>
                <p className="text-3xl font-bold mt-1 text-sky-500 tracking-tight">
                  {stats.avgOrder}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-sky-100 dark:bg-sky-900/30">
                <Tag className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>O&apos;rtacha tartib raqami</span>
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
                  <Video className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Hech narsa topilmadi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos video sharh
                  yo&apos;q
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((item, idx) => {
                const globalIndex =
                  (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const playerName =
                  item.name_uz || item.name_ru || item.name_en;
                const playerDesc =
                  item.description_uz ||
                  item.description_ru ||
                  item.description_en ||
                  "";
                return (
                  <div key={item.id} className="card-3d group">
                    <div className="card-3d-inner glass-card card-shine rounded-2xl overflow-hidden flex flex-col h-full">
                      {/* Avatar with Play Overlay */}
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/10">
                              <Camera className="h-10 w-10 text-primary/60" />
                            </div>
                            {item.video && (
                              <button
                                onClick={() => handlePlayVideo(item.video)}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <div className="icon-3d rounded-full p-1.5">
                                  <Play className="h-5 w-5 text-primary-foreground fill-current" />
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Number Badge */}
                        <div className="absolute top-3 left-3 icon-3d rounded-lg px-2.5 py-1 text-xs font-bold text-primary-foreground">
                          #{globalIndex}
                        </div>
                        {/* Order Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="text-[10px] px-2 py-0.5 bg-background/60 text-foreground backdrop-blur-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            {item.order ?? 0}
                          </Badge>
                        </div>
                        {/* Bottom overlay */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <Badge
                            className={`text-[10px] ${
                              item.is_active
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full mr-1 ${
                                item.is_active
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {item.is_active ? "Faol" : "No faol"}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm leading-snug line-clamp-1 mb-2">
                          {playerName || "—"}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {truncate(playerDesc, 60)}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                          {item.video ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handlePlayVideo(item.video)}
                            >
                              <Play className="h-3 w-3 fill-current" />
                              Video ko&apos;rish
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10"
                              onClick={() =>
                                router.push(`/video-reviews/${item.id}/edit`)
                              }
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
                  <Video className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Hech narsa topilmadi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Qidiruv so&apos;rovi yoki filtrlarga mos video sharh
                  yo&apos;q
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
                        Izoh
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          Video
                        </div>
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                        Holat
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Tartib
                        </div>
                      </th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => {
                      const globalIndex =
                        (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                      const playerName =
                        item.name_uz || item.name_ru || item.name_en || "—";
                      const playerDesc =
                        item.description_uz ||
                        item.description_ru ||
                        item.description_en ||
                        "";
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
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                                <Camera className="h-4 w-4 text-primary/60" />
                              </div>
                              <span className="font-medium text-sm line-clamp-1">
                                {playerName}
                              </span>
                            </div>
                          </td>
                          {/* Izoh */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {truncate(playerDesc, 60) || "—"}
                            </span>
                          </td>
                          {/* Video */}
                          <td className="px-5 py-3.5">
                            {item.video ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary -ml-2"
                                onClick={() => handlePlayVideo(item.video)}
                              >
                                <Play className="h-3 w-3 fill-current" />
                                Ko&apos;rish
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                          {/* Holat */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  item.is_active
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                                }`}
                              />
                              <span className="text-sm">
                                {item.is_active ? "Faol" : "No faol"}
                              </span>
                            </div>
                          </td>
                          {/* Tartib */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium">
                              {item.order ?? 0}
                            </span>
                          </td>
                          {/* Amallar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10"
                                onClick={() =>
                                  router.push(
                                    `/video-reviews/${item.id}/edit`
                                  )
                                }
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
            Jami{" "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            ta yozuv,{" "}
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
