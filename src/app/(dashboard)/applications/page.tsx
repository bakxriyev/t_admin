"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Eye, Send } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { applicationStatusOptions } from "@/lib/constants";
import api from "@/lib/api";
import { type CourseApplication } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function ApplicationsPage() {
  const router = useRouter();
  const [data, setData] = useState<CourseApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/courses");
      setData(res.data.data || []);
    } catch { toast.error("Yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/api/courses/${id}`, { status });
      toast.success("Holat yangilandi");
      fetchData();
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const handleSendTelegram = async (id: number) => {
    try {
      await api.post(`/api/courses/${id}/telegram`);
      toast.success("Telegram'ga yuborildi");
    } catch { toast.error("Yuborishda xatolik"); }
  };

  const columns: ColumnDef<CourseApplication>[] = [
    { accessorKey: "full_name", header: "Ism" },
    { accessorKey: "phone", header: "Telefon" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || "-" },
    { accessorKey: "course_name", header: "Kurs" },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(v) => handleStatusChange(row.original.id, v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue>
              <Badge className={getStatusColor(row.original.status)}>
                {applicationStatusOptions.find((o) => o.value === row.original.status)?.label}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {applicationStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { accessorKey: "created_at", header: "Sana", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/applications/${row.original.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleSendTelegram(row.original.id)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Arizalar</h1>
        <p className="text-muted-foreground mt-1">Kurslarga yozilish arizalari</p>
      </div>
      <DataTable columns={columns} data={data} searchKey="full_name" searchPlaceholder="Ism bo'yicha qidirish..." isLoading={loading} />
    </div>
  );
}
