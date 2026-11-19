"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, type NewsFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageTabs } from "./LanguageTabs";
import { FormLanguageSwitcher } from "./FormLanguageSwitcher";
import { ImageUpload } from "./ImageUpload";
import { statusOptions } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { fillMissingTranslations } from "@/lib/multilang";
import { useEffect, useState } from "react";

interface NewsFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function NewsForm({ initialData, isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: initialData || {
      status: "draft",
    },
  });

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: NewsFormData) => {
    setIsLoading(true);
    try {
      // Empty languages are filled from the first filled one (backend requires all three),
      // and only real form fields with a value are sent (no "undefined"/"null" strings).
      const filled = fillMissingTranslations(data, ["title", "content", "excerpt"]) as Record<string, unknown>;
      const formData = new FormData();
      Object.entries(filled).forEach(([key, value]) => {
        if (key === "image" || value === undefined || value === null) return;
        formData.append(key, String(value));
      });
      if (image) formData.append("image", image);

      if (isEdit && initialData?.id) {
        await api.put(`/api/news/${initialData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Yangilik yangilandi");
      } else {
        await api.post("/api/news", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Yangilik qo'shildi");
      }
      router.push("/news");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/news")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Yangilikni tahrirlash" : "Yangi yangilik"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <FormLanguageSwitcher />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Asosiy ma'lumotlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Holat</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => setValue("status", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <LanguageTabs>
              {(lang) => (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sarlavha ({lang === "uz" ? "O'zbek" : lang === "ru" ? "Русский" : "English"})</Label>
                    <Input {...register(`title_${lang}` as any)} placeholder="Sarlavha" />
                    {(errors as any)[`title_${lang}`] && (
                      <p className="text-sm text-destructive">{(errors as any)[`title_${lang}`]?.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Qisqacha matn ({lang === "uz" ? "O'zbek" : lang === "ru" ? "Русский" : "English"})</Label>
                    <Textarea {...register(`excerpt_${lang}` as any)} rows={3} placeholder="Qisqacha matn" />
                  </div>
                  <div className="space-y-2">
                    <Label>To'liq matn ({lang === "uz" ? "O'zbek" : lang === "ru" ? "Русский" : "English"})</Label>
                    <Textarea {...register(`content_${lang}` as any)} rows={10} placeholder="To'liq matn" />
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
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rasm</Label>
              <ImageUpload value={initialData?.image} onChange={setImage} />
            </div>
            <div className="space-y-2">
              <Label>Video URL (YouTube)</Label>
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
          <Button variant="outline" type="button" onClick={() => router.push("/news")}>
            Bekor qilish
          </Button>
        </div>
      </form>
    </div>
  );
}
