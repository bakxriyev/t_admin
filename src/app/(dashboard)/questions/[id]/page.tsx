"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import api from "@/lib/api";
import { type QuickQuestion } from "@/types";
import { toast } from "sonner";

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<QuickQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/quick-questions/${params.id}`);
        setData(res.data.data || res.data);
        if (res.data.data?.answer) setAnswerText(res.data.data.answer);
      } catch { toast.error("Yuklashda xatolik"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [params.id]);

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    setSaving(true);
    try {
      await api.put(`/api/quick-questions/${params.id}`, {
        answer: answerText,
        is_answered: true,
      });
      toast.success("Javob berildi");
      setData((prev) => prev ? { ...prev, answer: answerText, is_answered: true } : prev);
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
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
        <Button variant="ghost" size="icon" onClick={() => router.push("/questions")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Savol #{data.id}</h1>
        <Badge className={data.is_answered ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {data.is_answered ? "Javob berilgan" : "Kutilmoqda"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Savol ma'lumotlari</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Ism:</span>
              <p className="font-medium">{data.full_name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Telefon:</span>
              <p className="font-medium">{data.phone}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Sana:</span>
              <p className="font-medium">{formatDateTime(data.created_at)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Savol:</span>
              <p className="mt-1 text-sm bg-muted p-3 rounded-md">{data.question}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Javob berish</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Javobingizni yozing..."
              rows={8}
              disabled={data.is_answered}
            />
            {!data.is_answered && (
              <Button onClick={handleAnswer} disabled={saving || !answerText.trim()}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" /> Javob berish</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
