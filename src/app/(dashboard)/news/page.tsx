"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { formatDate, getStatusColor, truncate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type News } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function NewsPage() {
  const router = useRouter();
  const [data, setData] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  useEffect(() => { fetchData(); }, []);

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

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: "image",
      header: "Rasm",
      cell: ({ row }) => (
        <img src={getImageUrl(row.original.image)} alt="" className="h-10 w-16 rounded object-cover" />
      ),
    },
    {
      accessorKey: "title_uz",
      header: "Sarlavha",
      cell: ({ row }) => (
        <Link href={`/news/${row.original.id}`} className="hover:text-primary hover:underline font-medium transition-colors">
          {truncate(row.original.title_uz, 50)}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status === "published" ? "Nashr qilingan" : "Qoralama"}
        </Badge>
      ),
    },
    {
      accessorKey: "views",
      header: "Ko'rishlar",
    },
    {
      accessorKey: "created_at",
      header: "Sana",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/news/${row.original.id}`)}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push(`/news/${row.original.id}/edit`)}>
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
          <h1 className="text-3xl font-bold tracking-tight">Yangiliklar</h1>
          <p className="text-muted-foreground mt-1">Barcha yangiliklar</p>
        </div>
        <Button onClick={() => router.push("/news/create")}>
          <Plus className="mr-2 h-4 w-4" /> Yangi qo'shish
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="title_uz" searchPlaceholder="Sarlavha bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
