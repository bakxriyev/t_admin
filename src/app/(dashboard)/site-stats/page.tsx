"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import {
  Plus, Pencil, Trash2, Search, BarChart3, TrendingUp,
  ChevronLeft, ChevronRight, Loader2, ArrowUpDown,
} from "lucide-react";
import api from "@/lib/api";
import { type Statistic } from "@/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function SiteStatsPage() {
  const router = useRouter();
  const [data, setData] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/statistics");
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
      await api.delete(`/api/statistics/${deleteId}`);
      toast.success("Statistika o'chirildi");
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
    const active = data.filter((r) => r.is_active).length;
    const totalValue = data.reduce((sum, r) => sum + r.value, 0);
    return { total, active, totalValue };
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.label_uz?.toLowerCase().includes(s) ||
          r.label_ru?.toLowerCase().includes(s) ||
          r.label_en?.toLowerCase().includes(s)
      );
    }
    result.sort((a, b) => a.order - b.order);
    return result;
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-[400px] animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Statistika</h1>
          <p className="text-muted-foreground mt-1">Bosh sahifa statistik raqamlar</p>
        </div>
        <Button onClick={() => router.push("/site-stats/create")} className="btn-3d gap-2">
          <Plus className="h-4 w-4" />
          Yangi qo'shish
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Jami statistika
                </p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.total}</p>
              </div>
              <div className="icon-3d rounded-xl p-2.5">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Barcha ko'rsatkichlar</span>
            </div>
          </div>
        </div>
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Faol</p>
                <p className="text-3xl font-bold mt-1 text-emerald-500 tracking-tight">{stats.active}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% faol</span>
            </div>
          </div>
        </div>
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Umumiy qiymat</p>
                <p className="text-3xl font-bold mt-1 text-violet-500 tracking-tight">{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-violet-100 dark:bg-violet-900/30">
                <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              <span>Barcha raqamlar yig'indisi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-3d">
        <div className="card-3d-inner glass-card rounded-2xl p-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Statistika nomi bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>
      </div>

      <div className="card-3d">
        <div className="card-3d-inner glass-card rounded-2xl overflow-hidden">
          {paginated.length === 0 ? (
            <div className="p-16 text-center">
              <div className="icon-3d rounded-2xl p-4 mx-auto w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Hech narsa topilmadi</h3>
              <p className="text-sm text-muted-foreground">
                Hali hech qanday statistika qo'shilmagan
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nomi (UZ)</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nomi (RU)</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nomi (EN)</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Qiymat</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Qo'sh.</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Tartib</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Holat</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item, idx) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    return (
                      <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {globalIndex}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-sm">{item.label_uz}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted-foreground">{item.label_ru}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted-foreground">{item.label_en}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-lg font-bold">{item.value.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground ml-0.5">{item.suffix || ""}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <code className="text-xs bg-muted/50 rounded-md px-2 py-1 font-mono">{item.icon || "—"}</code>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant="outline" className="text-xs">{item.order}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-amber-500"}`} />
                            <span className="text-sm">{item.is_active ? "Faol" : "No faol"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10"
                              onClick={() => router.push(`/site-stats/${item.id}/edit`)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteId(item.id)}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jami{" "}
            <span className="font-medium text-foreground">{filtered.length}</span> ta yozuv,{" "}
            <span className="font-medium text-foreground">{currentPage}</span>/
            {totalPages} sahifa
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-9 w-9 p-0">
              <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 w-9 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <Button key={pageNum} variant={pageNum === currentPage ? "default" : "outline"} size="sm"
                  onClick={() => setCurrentPage(pageNum)} className="h-9 w-9 p-0 font-medium">
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 w-9 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-9 w-9 p-0">
              <ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
