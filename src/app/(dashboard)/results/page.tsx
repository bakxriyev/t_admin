"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate, getStatusColor, truncate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type Result } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/results");
      setData(res.data.data || []);
    } catch { toast.error("Yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/results/${deleteId}`);
      toast.success("Natija o'chirildi");
      fetchData();
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setDeleteLoading(false); setDeleteId(null); }
  };

  const columns: ColumnDef<Result>[] = [
    {
      accessorKey: "photo",
      header: "Rasm",
      cell: ({ row }) => <img src={getImageUrl(row.original.photo)} alt="" className="h-10 w-10 rounded-full object-cover" />,
    },
    { accessorKey: "student_name_uz", header: "Talaba", cell: ({ row }) => truncate(row.original.student_name_uz, 30) },
    { accessorKey: "achievement_uz", header: "Yutuq", cell: ({ row }) => truncate(row.original.achievement_uz, 40) },
    { accessorKey: "year", header: "Yil" },
    {
      accessorKey: "is_active",
      header: "Holat",
      cell: ({ row }) => (
        <Badge className={row.original.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.original.is_active ? "Faol" : "No faol"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/results/${row.original.id}/edit`)}>
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
          <h1 className="text-3xl font-bold tracking-tight">Natijalar</h1>
          <p className="text-muted-foreground mt-1">Talabalar yutuqlari</p>
        </div>
        <Button onClick={() => router.push("/results/create")}>
          <Plus className="mr-2 h-4 w-4" /> Yangi qo'shish
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="student_name_uz" searchPlaceholder="Talaba ismi bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
