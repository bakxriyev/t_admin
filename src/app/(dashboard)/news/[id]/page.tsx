"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Globe, Calendar, Eye } from "lucide-react";
import { formatDate, getImageUrl, getStatusColor } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";
import { languages } from "@/lib/translations";
import api from "@/lib/api";
import { type News } from "@/types";
import { toast } from "sonner";

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { lang, setLang } = useLanguage();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLang, setContentLang] = useState<string>(lang);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get(`/api/news/${params.id}`);
        setNews(res.data.data || res.data);
      } catch {
        toast.error("Ma'lumotni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) fetchNews();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Yangilik topilmadi
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/news")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Yangilik</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/news/${news.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" /> Tahrirlash
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" /> Til:
              </div>
              <div className="flex gap-1">
                {languages.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setContentLang(l.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${
                      contentLang === l.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(news.status)}>
                {news.status === "published" ? "Nashr qilingan" : "Qoralama"}
              </Badge>
            </div>
          </div>

          {news.image && (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-muted">
              <img
                src={getImageUrl(news.image)}
                alt={news[`title_${contentLang}` as keyof News] as string || ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              {(news as any)[`title_${contentLang}`] || (news as any)[`title_uz`]}
            </h2>

            {(news as any)[`excerpt_${contentLang}`] && (
              <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
                {(news as any)[`excerpt_${contentLang}`]}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {formatDate(news.created_at, "dd.MM.yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {news.views} ko'rish
              </span>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap leading-relaxed">
              {(news as any)[`content_${contentLang}`] || (news as any)[`content_uz`]}
            </div>
          </div>

          {news.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={news.video_url.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allowFullScreen
                title="Video"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
