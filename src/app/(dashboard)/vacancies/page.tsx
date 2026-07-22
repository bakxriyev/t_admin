"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate, getStatusColor, truncate } from "@/lib/utils";
import api from "@/lib/api";
import { type Vacancy } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function VacanciesPage() {
  const router = useRouter();
  const [data, setData] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/vacancies");
      setData(res.data.data || []);
    } catch { toast.error("Yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/vacancies/${deleteId}`);
      toast.success("Vakansiya o'chirildi");
      fetchData();
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setDeleteLoading(false); setDeleteId(null); }
  };

  const columns: ColumnDef<Vacancy>[] = [
    { accessorKey: "title_uz", header: "Sarlavha", cell: ({ row }) => truncate(row.original.title_uz, 40) },
    {
      accessorKey: "type",
      header: "Turi",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.type === "full_time" ? "To'liq vaqt" : row.original.type === "part_time" ? "Yarim vaqt" : "Amaliyot"}
        </Badge>
      ),
    },
    { accessorKey: "salary", header: "Maosh", cell: ({ row }) => row.original.salary || "-" },
    {
      accessorKey: "is_active",
      header: "Holat",
      cell: ({ row }) => (
        <Badge className={row.original.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.original.is_active ? "Faol" : "Yopiq"}
        </Badge>
      ),
    },
    { accessorKey: "created_at", header: "Sana", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/vacancies/${row.original.id}/edit`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vakansiyalar</h1>
          <p className="text-muted-foreground mt-1">Barcha vakansiyalar ro'yxati</p>
        </div>
        <Button onClick={() => router.push("/vacancies/create")}>
          <Plus className="mr-2 h-4 w-4" /> Yangi qo'shish
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="title_uz" searchPlaceholder="Sarlavha bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
