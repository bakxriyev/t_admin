"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageTabs } from "@/components/shared/LanguageTabs";
import { FormLanguageSwitcher } from "@/components/shared/FormLanguageSwitcher";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Loader2, Save, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const aboutSchema = z.object({
  content_uz: z.string().min(1),
  content_ru: z.string().min(1),
  content_en: z.string().min(1),
  mission_uz: z.string().optional(),
  mission_ru: z.string().optional(),
  mission_en: z.string().optional(),
  vision_uz: z.string().optional(),
  vision_ru: z.string().optional(),
  vision_en: z.string().optional(),
});

type AboutFormData = z.infer<typeof aboutSchema>;
type ValueItem = { id: number; key: string; title_uz: string; title_ru: string; title_en: string; description_uz: string; description_ru: string; description_en: string; order: number };
type TimelineItem = { id: number; year: string; title_uz: string; title_ru: string; title_en: string; description_uz: string; description_ru: string; description_en: string; order: number };

const LANG_LABELS: Record<string, string> = { uz: "O'zbek", ru: "Русский", en: "English" };

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [aboutId, setAboutId] = useState<number | null>(null);
  const [values, setValues] = useState<ValueItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [editValues, setEditValues] = useState<Record<number, ValueItem>>({});
  const [editTimeline, setEditTimeline] = useState<Record<number, TimelineItem>>({});
  const [newTimeline, setNewTimeline] = useState<Partial<TimelineItem> | null>(null);
  const [savingValue, setSavingValue] = useState<number | null>(null);
  const [savingTimeline, setSavingTimeline] = useState<number | 'new' | null>(null);
  const [deletingTimeline, setDeletingTimeline] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, valuesRes, timelineRes] = await Promise.all([
          api.get("/api/about"),
          api.get("/api/about-values"),
          api.get("/api/timeline"),
        ]);
        const aboutData = aboutRes.data.data || aboutRes.data;
        const item = Array.isArray(aboutData) ? aboutData[0] : aboutData;
        if (item) {
          setAboutId(item.id);
          reset({
            content_uz: item.content_uz || "",
            content_ru: item.content_ru || "",
            content_en: item.content_en || "",
            mission_uz: item.mission_uz || "",
            mission_ru: item.mission_ru || "",
            mission_en: item.mission_en || "",
            vision_uz: item.vision_uz || "",
            vision_ru: item.vision_ru || "",
            vision_en: item.vision_en || "",
          });
        }
        const vals = valuesRes.data.data || valuesRes.data || [];
        const tims = timelineRes.data.data || timelineRes.data || [];
        setValues(Array.isArray(vals) ? vals : []);
        setTimeline(Array.isArray(tims) ? tims : []);
      } catch { toast.error("Ma'lumotlarni yuklashda xatolik"); }
      finally { setPageLoading(false); }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (data: AboutFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value as string));
      if (image) formData.append("image", image);
      if (aboutId) {
        await api.put(`/api/about/${aboutId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/about", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("Saqlanib qoldi");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally { setIsLoading(false); }
  };

  const startEditValue = (v: ValueItem) => {
    setEditValues((prev) => ({ ...prev, [v.id]: { ...v } }));
  };

  const cancelEditValue = (id: number) => {
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEditValue = (id: number, field: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveValue = async (id: number) => {
    setSavingValue(id);
    try {
      const data = editValues[id];
      await api.put(`/api/about-values/${id}`, {
        title_uz: data.title_uz,
        title_ru: data.title_ru,
        title_en: data.title_en,
        description_uz: data.description_uz,
        description_ru: data.description_ru,
        description_en: data.description_en,
      });
      setValues((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
      cancelEditValue(id);
      toast.success("Saqlanib qoldi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSavingValue(null); }
  };

  const saveNewTimeline = async () => {
    if (!newTimeline?.year) { toast.error("Yil majburiy"); return; }
    setSavingTimeline('new');
    try {
      const res = await api.post("/api/timeline", newTimeline);
      const created = res.data.data || res.data;
      setTimeline((prev) => [...prev, created].sort((a, b) => (a.order || 0) - (b.order || 0)));
      setNewTimeline(null);
      toast.success("Qo'shildi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSavingTimeline(null); }
  };

  const startEditTimeline = (t: TimelineItem) => {
    setEditTimeline((prev) => ({ ...prev, [t.id]: { ...t } }));
  };

  const cancelEditTimeline = (id: number) => {
    setEditTimeline((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEditTimeline = (id: number, field: string, value: string) => {
    setEditTimeline((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveTimelineItem = async (id: number) => {
    setSavingTimeline(id);
    try {
      const data = editTimeline[id];
      await api.put(`/api/timeline/${id}`, data);
      setTimeline((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      cancelEditTimeline(id);
      toast.success("Saqlanib qoldi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSavingTimeline(null); }
  };

  const deleteTimelineItem = async (id: number) => {
    setDeletingTimeline(id);
    try {
      await api.delete(`/api/timeline/${id}`);
      setTimeline((prev) => prev.filter((t) => t.id !== id));
      toast.success("O'chirildi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setDeletingTimeline(null); }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderMultilangFields = (label: string, fieldPrefix: string, item: any, onChange: (field: string, value: string) => void, textarea = false) => (
    <LanguageTabs>
      {(lang) => (
        <div className="space-y-2">
          <Label>{label} ({LANG_LABELS[lang]})</Label>
          {textarea ? (
            <Textarea value={item[`${fieldPrefix}_${lang}`] || ""} onChange={(e) => onChange(`${fieldPrefix}_${lang}`, e.target.value)} rows={3} />
          ) : (
            <Input value={item[`${fieldPrefix}_${lang}`] || ""} onChange={(e) => onChange(`${fieldPrefix}_${lang}`, e.target.value)} />
          )}
        </div>
      )}
    </LanguageTabs>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biz haqimizda</h1>
        <p className="text-muted-foreground mt-1">Saytning "Biz haqimizda" bo'limi</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <FormLanguageSwitcher />
        </div>

        <Card>
          <CardHeader><CardTitle>Umumiy ma'lumot</CardTitle></CardHeader>
          <CardContent>
            <LanguageTabs>
              {(lang) => (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Matn ({LANG_LABELS[lang]})</Label>
                    <Textarea {...register(`content_${lang}` as any)} rows={10} />
                    {(errors as any)[`content_${lang}`] && (
                      <p className="text-sm text-destructive">{(errors as any)[`content_${lang}`]?.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Missiya ({LANG_LABELS[lang]})</Label>
                    <Textarea {...register(`mission_${lang}` as any)} rows={5} />
                  </div>
                  <div className="space-y-2">
                    <Label>Maqsad ({LANG_LABELS[lang]})</Label>
                    <Textarea {...register(`vision_${lang}` as any)} rows={5} />
                  </div>
                </div>
              )}
            </LanguageTabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rasm</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload value={null} onChange={setImage} />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...</> : <><Save className="mr-2 h-4 w-4" /> Saqlash</>}
        </Button>
      </form>

      <Card>
        <CardHeader><CardTitle>Qadriyatlar</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {values.length === 0 && <p className="text-muted-foreground">Hozircha qadriyatlar yo'q</p>}
          {values.map((v) => (
            <div key={v.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg capitalize">{v.key}</h3>
                <div className="flex gap-2">
                  {editValues[v.id] ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => saveValue(v.id)} disabled={savingValue === v.id}>
                        {savingValue === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cancelEditValue(v.id)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => startEditValue(v)}><Pencil className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
              {editValues[v.id] ? (
                <div className="space-y-3">
                  {renderMultilangFields("Sarlavha", "title", editValues[v.id], (f, val) => updateEditValue(v.id, f, val))}
                  {renderMultilangFields("Tavsif", "description", editValues[v.id], (f, val) => updateEditValue(v.id, f, val), true)}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="font-medium">UZ:</span> {v.title_uz}</div>
                  <div><span className="font-medium">RU:</span> {v.title_ru}</div>
                  <div><span className="font-medium">EN:</span> {v.title_en}</div>
                  <div className="col-span-3"><span className="font-medium">Tavsif:</span> {v.description_uz}</div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bizning yo'limiz</CardTitle>
          <Button size="sm" onClick={() => setNewTimeline({ year: "", title_uz: "", title_ru: "", title_en: "", description_uz: "", description_ru: "", description_en: "", order: timeline.length + 1 })}>
            <Plus className="mr-1 h-4 w-4" /> Yangi qo'shish
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeline.length === 0 && !newTimeline && <p className="text-muted-foreground">Hozircha hodisalar yo'q</p>}

          {newTimeline && (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Yangi hodisa</h3>
                <Button variant="ghost" size="sm" onClick={() => setNewTimeline(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2">
                <Label>Yil</Label>
                <Input value={newTimeline.year || ""} onChange={(e) => setNewTimeline((prev) => ({ ...prev!, year: e.target.value }))} placeholder="2024" className={inputClass} />
              </div>
              {renderMultilangFields("Sarlavha", "title", newTimeline, (f, val) => setNewTimeline((prev) => ({ ...prev!, [f]: val })))}
              {renderMultilangFields("Tavsif", "description", newTimeline, (f, val) => setNewTimeline((prev) => ({ ...prev!, [f]: val })), true)}
              <Button onClick={saveNewTimeline} disabled={savingTimeline === 'new'} size="sm">
                {savingTimeline === 'new' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Saqlash
              </Button>
            </div>
          )}

          {timeline.map((t) => (
            <div key={t.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{t.year}</h3>
                <div className="flex gap-1">
                  {editTimeline[t.id] ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => saveTimelineItem(t.id)} disabled={savingTimeline === t.id}>
                        {savingTimeline === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cancelEditTimeline(t.id)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => startEditTimeline(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTimelineItem(t.id)} disabled={deletingTimeline === t.id}>
                        {deletingTimeline === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editTimeline[t.id] ? (
                <div className="space-y-3">
                  {renderMultilangFields("Sarlavha", "title", editTimeline[t.id], (f, val) => updateEditTimeline(t.id, f, val))}
                  {renderMultilangFields("Tavsif", "description", editTimeline[t.id], (f, val) => updateEditTimeline(t.id, f, val), true)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div><span className="font-medium">UZ:</span> {t.title_uz}</div>
                  <div className="text-muted-foreground text-xs">{t.description_uz}</div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
