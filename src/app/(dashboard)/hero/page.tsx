"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { truncate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type Hero } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function HeroesPage() {
  const router = useRouter();
  const [data, setData] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/hero");
      setData(res.data.data || []);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/hero/${deleteId}`);
      toast.success("Hero slayd o'chirildi");
      fetchData();
    } catch {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Hero>[] = [
    {
      accessorKey: "image",
      header: "Rasm",
      cell: ({ row }) => (
        <img src={getImageUrl(row.original.image)} alt="" className="h-10 w-16 rounded object-cover" />
      ),
    },
    { accessorKey: "title_uz", header: "Sarlavha", cell: ({ row }) => truncate(row.original.title_uz, 30) },
    { accessorKey: "subtitle_uz", header: "Subtitr", cell: ({ row }) => truncate(row.original.subtitle_uz, 30) },
    {
      accessorKey: "is_active",
      header: "Holat",
      cell: ({ row }) => (
        <Badge className={row.original.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.original.is_active ? "Faol" : "No faol"}
        </Badge>
      ),
    },
    { accessorKey: "order", header: "Tartib" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/hero/${row.original.id}/edit`)}>
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
          <h1 className="text-3xl font-bold tracking-tight">Hero Slaydlar</h1>
          <p className="text-muted-foreground mt-1">Barcha hero slaydlar ro'yxati</p>
        </div>
        <Button onClick={() => router.push("/hero/create")}>
          <Plus className="mr-2 h-4 w-4" /> Yangi qo'shish
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="title_uz" searchPlaceholder="Sarlavha bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
