"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, CheckCircle, MessageSquare } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import { type QuickQuestion } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function QuestionsPage() {
  const router = useRouter();
  const [data, setData] = useState<QuickQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/quick-questions");
      setData(res.data.data || []);
    } catch { toast.error("Yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleAnswer = async () => {
    if (!selectedId || !answerText.trim()) return;
    try {
      await api.put(`/api/quick-questions/${selectedId}`, {
        answer: answerText,
        is_answered: true,
      });
      toast.success("Javob berildi");
      setSelectedId(null);
      setAnswerText("");
      fetchData();
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const columns: ColumnDef<QuickQuestion>[] = [
    { accessorKey: "full_name", header: "Ism" },
    { accessorKey: "phone", header: "Telefon" },
    { accessorKey: "question", header: "Savol", cell: ({ row }) => row.original.question.substring(0, 60) + "..." },
    {
      accessorKey: "is_answered",
      header: "Holat",
      cell: ({ row }) => (
        <Badge className={row.original.is_answered ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {row.original.is_answered ? "Javob berilgan" : "Kutilmoqda"}
        </Badge>
      ),
    },
    { accessorKey: "created_at", header: "Sana", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/questions/${row.original.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          {!row.original.is_answered && (
            <Dialog open={selectedId === row.original.id} onOpenChange={(o) => { if (!o) setSelectedId(null); else setSelectedId(row.original.id); }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Javob berish</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Savol:</p>
                    <p className="text-sm text-muted-foreground">{row.original.question}</p>
                  </div>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Javobingiz..."
                    rows={5}
                  />
                  <Button onClick={handleAnswer} disabled={!answerText.trim()}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Javob berish
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Savollar</h1>
        <p className="text-muted-foreground mt-1">Foydalanuvchilardan kelgan savollar</p>
      </div>
      <DataTable columns={columns} data={data} searchKey="full_name" searchPlaceholder="Ism bo'yicha qidirish..." isLoading={loading} />
    </div>
  );
}
