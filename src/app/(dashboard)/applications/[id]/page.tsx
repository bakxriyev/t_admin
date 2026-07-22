"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { applicationStatusOptions } from "@/lib/constants";
import api from "@/lib/api";
import { type CourseApplication } from "@/types";
import { toast } from "sonner";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<CourseApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/courses/${params.id}`);
        setData(res.data.data || res.data);
      } catch { toast.error("Yuklashda xatolik"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [params.id]);

  const handleSendTelegram = async () => {
    try {
      await api.post(`/api/courses/${params.id}/telegram`);
      toast.success("Telegram'ga yuborildi");
    } catch { toast.error("Yuborishda xatolik"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Ma'lumot topilmadi</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/applications")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Ariza #{data.id}</h1>
        <Badge className={getStatusColor(data.status)}>
          {applicationStatusOptions.find((o) => o.value === data.status)?.label}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Shaxsiy ma'lumotlar</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">Ism:</span><p className="font-medium">{data.full_name}</p></div>
            <div><span className="text-sm text-muted-foreground">Telefon:</span><p className="font-medium">{data.phone}</p></div>
            <div><span className="text-sm text-muted-foreground">Email:</span><p className="font-medium">{data.email || "-"}</p></div>
            <div><span className="text-sm text-muted-foreground">Kurs:</span><p className="font-medium">{data.course_name}</p></div>
            <div><span className="text-sm text-muted-foreground">Yaratilgan:</span><p className="font-medium">{formatDateTime(data.created_at)}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Amallar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSendTelegram} className="w-full">
              <Send className="mr-2 h-4 w-4" /> Telegram'ga yuborish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
