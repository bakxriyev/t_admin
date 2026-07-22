"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import api from "@/lib/api";
import { type SocialLink } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function SocialLinksPage() {
  const router = useRouter();
  const [data, setData] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/social-links");
      setData(res.data.data || []);
    } catch { toast.error("Yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/social-links/${deleteId}`);
      toast.success("O'chirildi");
      fetchData();
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setDeleteLoading(false); setDeleteId(null); }
  };

  const columns: ColumnDef<SocialLink>[] = [
    { accessorKey: "platform", header: "Platforma" },
    { accessorKey: "url", header: "URL", cell: ({ row }) => truncate(row.original.url, 50) },
    { accessorKey: "order", header: "Tartib" },
    { accessorKey: "created_at", header: "Sana", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/social-links/${row.original.id}/edit`)}>
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
          <h1 className="text-3xl font-bold tracking-tight">Ijtimoiy tarmoqlar</h1>
          <p className="text-muted-foreground mt-1">Ijtimoiy tarmoq havolalari</p>
        </div>
        <Button onClick={() => router.push("/social-links/create")}>
          <Plus className="mr-2 h-4 w-4" /> Yangi qo'shish
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="platform" searchPlaceholder="Platforma bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
