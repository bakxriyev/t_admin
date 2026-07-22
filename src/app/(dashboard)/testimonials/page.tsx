"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { Plus, Pencil, Trash2, Video, FileText } from "lucide-react";
import { truncate, getImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function TestimonialsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/testimonials");
      setData(res.data.data || []);
    } catch { toast.error("Ma'lumotlarni yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/testimonials/${deleteId}`);
      toast.success("Fikr o'chirildi");
      fetchData();
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setDeleteLoading(false); setDeleteId(null); }
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: "image", header: "Rasm", cell: ({ row }) => <img src={getImageUrl(row.original.image)} alt="" className="h-10 w-10 rounded-full object-cover" /> },
    { accessorKey: "name_uz", header: "Ism (UZ)" },
    { accessorKey: "position_uz", header: "Lavozim (UZ)", cell: ({ row }) => truncate(row.original.position_uz || "", 30) },
    { accessorKey: "type", header: "Tur", cell: ({ row }) => <Badge className={row.original.type === "video" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>{row.original.type === "video" ? <><Video className="h-3 w-3 inline mr-1" /> Video</> : <><FileText className="h-3 w-3 inline mr-1" /> Matn</>}</Badge> },
    { accessorKey: "is_active", header: "Holat", cell: ({ row }) => <Badge className={row.original.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{row.original.is_active ? "Faol" : "No faol"}</Badge> },
    { accessorKey: "order", header: "Tartib" },
    { id: "actions", cell: ({ row }) => <div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => router.push(`/testimonials/${row.original.id}/edit`)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">O'quvchilar Fikrlari</h1><p className="text-muted-foreground mt-1">Barcha fikr va video tavsiyalar</p></div>
        <Button onClick={() => router.push("/testimonials/create")}><Plus className="mr-2 h-4 w-4" /> Yangi qo'shish</Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="name_uz" searchPlaceholder="Ism bo'yicha qidirish..." isLoading={loading} />
      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
