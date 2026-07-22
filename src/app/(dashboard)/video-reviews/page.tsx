"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import { truncate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function VideoReviewsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/video-reviews");
      setData(res.data.data || []);
    } catch { toast.error("Ma'lumotlarni yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/video-reviews/${deleteId}`);
      toast.success("Video sharh o'chirildi");
      fetchData();
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setDeleteLoading(false); setDeleteId(null); }
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name_uz", header: "Ism (UZ)" },
    { accessorKey: "description_uz", header: "Izoh (UZ)", cell: ({ row }) => truncate(row.original.description_uz || "", 40) },
    { accessorKey: "video", header: "Video", cell: ({ row }) => (
      row.original.video ? (
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.open(getImageUrl(row.original.video), "_blank")}>
          <Play className="h-3 w-3" /> Ko'rish
        </Button>
      ) : <span className="text-muted-foreground text-xs">—</span>
    )},
    { accessorKey: "is_active", header: "Holat", cell: ({ row }) => <Badge className={row.original.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{row.original.is_active ? "Faol" : "No faol"}</Badge> },
    { accessorKey: "order", header: "Tartib" },
    { id: "actions", cell: ({ row }) => <div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => router.push(`/video-reviews/${row.original.id}/edit`)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Video Sharhlar</h1><p className="text-muted-foreground mt-1">Talabalar video sharhlari</p></div>
        <Button onClick={() => router.push("/video-reviews/create")}><Plus className="mr-2 h-4 w-4" /> Yangi qo'shish</Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="name_uz" searchPlaceholder="Ism bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
