"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, type NewsFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LanguageTabs } from "@/components/shared/LanguageTabs";
import { FormLanguageSwitcher } from "@/components/shared/FormLanguageSwitcher";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { statusOptions } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useState, useEffect } from "react";

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get(`/api/news/${params.id}`);
        const data = res.data.data || res.data;
        setInitialData(data);
        reset({
          title_uz: data.title_uz || "",
          title_ru: data.title_ru || "",
          title_en: data.title_en || "",
          content_uz: data.content_uz || "",
          content_ru: data.content_ru || "",
          content_en: data.content_en || "",
          excerpt_uz: data.excerpt_uz || "",
          excerpt_ru: data.excerpt_ru || "",
          excerpt_en: data.excerpt_en || "",
          status: data.status || "draft",
          video_url: data.video_url || "",
        });
      } catch {
        toast.error("Ma'lumotni yuklashda xatolik");
      } finally {
        setPageLoading(false);
      }
    };
    fetchNews();
  }, [params.id, reset]);

  const onSubmit = async (data: NewsFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "image") formData.append(key, value as string);
      });
      if (image) formData.append("image", image);
      await api.put(`/api/news/${params.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Yangilik yangilandi");
      router.push("/news");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/news")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Yangilikni tahrirlash</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <FormLanguageSwitcher />
        </div>
        <Card>
          <CardHeader><CardTitle>Asosiy ma'lumotlar</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Holat</Label>
                <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <LanguageTabs>
              {(lang) => (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sarlavha ({lang === "uz" ? "O'zbek" : lang === "ru" ? "Русский" : "English"})</Label>
                    <Input {...register(`title_${lang}` as any)} />
                    {(errors as any)[`title_${lang}`] && (
                      <p className="text-sm text-destructive">{(errors as any)[`title_${lang}`]?.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Qisqacha matn ({lang === "uz" ? "O'zbek" : lang === "ru" ? "Русский" : "English"})</Label>
                    <Textarea {...register(`excerpt_${lang}` as any)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>To'liq matn ({lang === "uz" ? "O'zbek" : lang === "ru" ? "Русский" : "English"})</Label>
                    <Textarea {...register(`content_${lang}` as any)} rows={10} />
                    {(errors as any)[`content_${lang}`] && (
                      <p className="text-sm text-destructive">{(errors as any)[`content_${lang}`]?.message}</p>
                    )}
                  </div>
                </div>
              )}
            </LanguageTabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rasm</Label>
              <ImageUpload value={initialData?.image} onChange={setImage} />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input {...register("video_url")} placeholder="https://youtube.com/watch?v=..." />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Saqlash</>
            )}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.push("/news")}>Bekor qilish</Button>
        </div>
      </form>
    </div>
  );
}
