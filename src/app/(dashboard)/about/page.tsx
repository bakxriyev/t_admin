"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LanguageTabs } from "@/components/shared/LanguageTabs";
import { FormLanguageSwitcher } from "@/components/shared/FormLanguageSwitcher";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Info,
  Heart,
  Clock,
  Calendar,
  MapPin,
  Globe,
} from "lucide-react";
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
type ValueItem = {
  id: number;
  key: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  order: number;
};
type TimelineItem = {
  id: number;
  year: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  order: number;
};

const LANG_LABELS: Record<string, string> = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English",
};

const LANG_FLAGS: Record<string, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

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
  const [savingTimeline, setSavingTimeline] = useState<number | "new" | null>(null);
  const [deleteTimelineId, setDeleteTimelineId] = useState<number | null>(null);
  const [deleteTimelineLoading, setDeleteTimelineLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AboutFormData>({
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
      } catch {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (data: AboutFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) =>
        formData.append(key, value as string)
      );
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
    } finally {
      setIsLoading(false);
    }
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
      setValues((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...data } : v))
      );
      cancelEditValue(id);
      toast.success("Saqlanib qoldi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSavingValue(null);
    }
  };

  const saveNewTimeline = async () => {
    if (!newTimeline?.year) {
      toast.error("Yil majburiy");
      return;
    }
    setSavingTimeline("new");
    try {
      const res = await api.post("/api/timeline", newTimeline);
      const created = res.data.data || res.data;
      setTimeline((prev) =>
        [...prev, created].sort((a, b) => (a.order || 0) - (b.order || 0))
      );
      setNewTimeline(null);
      toast.success("Qo'shildi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSavingTimeline(null);
    }
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
      setTimeline((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      cancelEditTimeline(id);
      toast.success("Saqlanib qoldi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSavingTimeline(null);
    }
  };

  const confirmDeleteTimeline = async () => {
    if (!deleteTimelineId) return;
    setDeleteTimelineLoading(true);
    try {
      await api.delete(`/api/timeline/${deleteTimelineId}`);
      setTimeline((prev) => prev.filter((t) => t.id !== deleteTimelineId));
      toast.success("O'chirildi");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setDeleteTimelineLoading(false);
      setDeleteTimelineId(null);
    }
  };

  const renderMultilangFields = (
    label: string,
    fieldPrefix: string,
    item: any,
    onChange: (field: string, value: string) => void,
    textarea = false
  ) => (
    <LanguageTabs>
      {(lang) => (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label} ({LANG_FLAGS[lang]})
          </Label>
          {textarea ? (
            <Textarea
              value={item[`${fieldPrefix}_${lang}`] || ""}
              onChange={(e) =>
                onChange(`${fieldPrefix}_${lang}`, e.target.value)
              }
              rows={3}
              className="bg-background/50 resize-none"
            />
          ) : (
            <Input
              value={item[`${fieldPrefix}_${lang}`] || ""}
              onChange={(e) =>
                onChange(`${fieldPrefix}_${lang}`, e.target.value)
              }
              className="bg-background/50"
            />
          )}
        </div>
      )}
    </LanguageTabs>
  );

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Info className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Biz haqimizda
          </h1>
          <p className="text-muted-foreground mt-1">
            Saytning &quot;Biz haqimizda&quot; bo&apos;limi ma&apos;lumotlarini boshqaring
          </p>
        </div>
        <FormLanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Umumiy ma'lumot */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-3d rounded-xl p-2.5 shrink-0">
                <Info className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Umumiy ma&apos;lumot</h3>
                <p className="text-sm text-muted-foreground">
                  Asosiy matn, missiya va maqsadlarni 3 tilda kiriting
                </p>
              </div>
            </div>
            <LanguageTabs>
              {(lang) => (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Matn ({LANG_FLAGS[lang]})
                    </Label>
                    <Textarea
                      {...(register(`content_${lang}` as any) as any)}
                      rows={8}
                      className="bg-background/50 resize-none"
                    />
                    {(errors as any)[`content_${lang}`] && (
                      <p className="text-sm text-destructive">
                        {(errors as any)[`content_${lang}`]?.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Missiya ({LANG_FLAGS[lang]})
                      </Label>
                      <Textarea
                        {...(register(`mission_${lang}` as any) as any)}
                        rows={4}
                        className="bg-background/50 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Maqsad ({LANG_FLAGS[lang]})
                      </Label>
                      <Textarea
                        {...(register(`vision_${lang}` as any) as any)}
                        rows={4}
                        className="bg-background/50 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </LanguageTabs>
          </div>
        </div>

        {/* Rasm */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-3d rounded-xl p-2.5 shrink-0">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Rasm</h3>
                <p className="text-sm text-muted-foreground">
                  &quot;Biz haqimizda&quot; bo&apos;limi uchun asosiy rasm
                </p>
              </div>
            </div>
            <ImageUpload value={null} onChange={setImage} />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="btn-3d px-8">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Saqlash
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Qadriyatlar */}
      <div className="card-3d">
        <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="icon-3d rounded-xl p-2.5 shrink-0">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Qadriyatlar</h3>
              <p className="text-sm text-muted-foreground">
                Asosiy qadriyatlar ro&apos;yxati
              </p>
            </div>
          </div>

          {values.length === 0 && (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 mx-auto flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Hozircha qadriyatlar yo&apos;q
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.id}
                className="group rounded-xl glass-card p-5 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 uppercase">
                      {v.key?.charAt(0) || v.title_uz?.charAt(0) || "?"}
                    </div>
                    <h4 className="font-semibold text-sm capitalize line-clamp-1">
                      {v.key || v.title_uz}
                    </h4>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editValues[v.id] ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
                          onClick={() => saveValue(v.id)}
                          disabled={savingValue === v.id}
                        >
                          {savingValue === v.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30"
                          onClick={() => cancelEditValue(v.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-primary/10"
                        onClick={() => startEditValue(v)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {editValues[v.id] ? (
                  <div className="space-y-3">
                    {renderMultilangFields(
                      "Sarlavha",
                      "title",
                      editValues[v.id],
                      (f, val) => updateEditValue(v.id, f, val)
                    )}
                    {renderMultilangFields(
                      "Tavsif",
                      "description",
                      editValues[v.id],
                      (f, val) => updateEditValue(v.id, f, val),
                      true
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {["uz", "ru", "en"].map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
                        >
                          <span className="font-semibold">{LANG_FLAGS[l]}</span>
                          <span className="truncate max-w-[120px]">
                            {v[`title_${l}` as keyof ValueItem] as string}
                          </span>
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {(v.description_uz as string) || ""}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline / Bizning yo'limiz */}
      <div className="card-3d">
        <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="icon-3d rounded-xl p-2.5 shrink-0">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bizning yo&apos;limiz</h3>
              <p className="text-sm text-muted-foreground">
                Tarix va rivojlanish bosqichlari
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                setNewTimeline({
                  year: "",
                  title_uz: "",
                  title_ru: "",
                  title_en: "",
                  description_uz: "",
                  description_ru: "",
                  description_en: "",
                  order: timeline.length + 1,
                })
              }
              className="btn-3d gap-2"
            >
              <Plus className="h-4 w-4" />
              Yangi qo&apos;shish
            </Button>
          </div>

          {timeline.length === 0 && !newTimeline && (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 mx-auto flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Hozircha hodisalar yo&apos;q
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* New Timeline Form */}
            {newTimeline && (
              <div className="rounded-xl glass-card p-5 space-y-4 border border-primary/20 bg-primary/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-3d rounded-lg p-1.5">
                      <Plus className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h4 className="font-semibold text-sm">Yangi hodisa</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30"
                    onClick={() => setNewTimeline(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Yil
                  </Label>
                  <Input
                    value={newTimeline.year || ""}
                    onChange={(e) =>
                      setNewTimeline((prev) => ({
                        ...prev!,
                        year: e.target.value,
                      }))
                    }
                    placeholder="2024"
                    className="bg-background/50"
                  />
                </div>
                {renderMultilangFields("Sarlavha", "title", newTimeline, (f, val) =>
                  setNewTimeline((prev) => ({ ...prev!, [f]: val }))
                )}
                {renderMultilangFields(
                  "Tavsif",
                  "description",
                  newTimeline,
                  (f, val) => setNewTimeline((prev) => ({ ...prev!, [f]: val })),
                  true
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewTimeline(null)}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    onClick={saveNewTimeline}
                    disabled={savingTimeline === "new"}
                    size="sm"
                    className="btn-3d gap-1.5"
                  >
                    {savingTimeline === "new" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Saqlash
                  </Button>
                </div>
              </div>
            )}

            {/* Timeline Items */}
            {timeline.map((t, idx) => {
              const isEditing = !!editTimeline[t.id];
              return (
                <div
                  key={t.id}
                  className="group rounded-xl glass-card p-5 hover:scale-[1.005] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Year badge */}
                    <div className="icon-3d rounded-xl px-3 py-2 shrink-0 flex flex-col items-center min-w-[72px]">
                      <Calendar className="h-4 w-4 text-primary-foreground mb-0.5" />
                      <span className="text-sm font-bold text-primary-foreground">
                        {t.year}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">
                          {t.title_uz || t.title_ru || t.title_en}
                        </h4>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
                                onClick={() => saveTimelineItem(t.id)}
                                disabled={savingTimeline === t.id}
                              >
                                {savingTimeline === t.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30"
                                onClick={() => cancelEditTimeline(t.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/10"
                                onClick={() => startEditTimeline(t)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTimelineId(t.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-3 mt-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Yil
                            </Label>
                            <Input
                              value={editTimeline[t.id].year || ""}
                              onChange={(e) =>
                                updateEditTimeline(t.id, "year", e.target.value)
                              }
                              className="bg-background/50"
                            />
                          </div>
                          {renderMultilangFields(
                            "Sarlavha",
                            "title",
                            editTimeline[t.id],
                            (f, val) => updateEditTimeline(t.id, f, val)
                          )}
                          {renderMultilangFields(
                            "Tavsif",
                            "description",
                            editTimeline[t.id],
                            (f, val) => updateEditTimeline(t.id, f, val),
                            true
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {["uz", "ru", "en"].map((l) => (
                              <span
                                key={l}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
                              >
                                <span className="font-semibold">
                                  {LANG_FLAGS[l]}
                                </span>
                                <span className="truncate max-w-[120px]">
                                  {
                                    t[
                                      `title_${l}` as keyof TimelineItem
                                    ] as string
                                  }
                                </span>
                              </span>
                            ))}
                          </div>
                          {(t.description_uz as string) && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {t.description_uz as string}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation for Timeline */}
      <DeleteConfirmModal
        open={!!deleteTimelineId}
        onOpenChange={(o) => {
          if (!o) setDeleteTimelineId(null);
        }}
        onConfirm={confirmDeleteTimeline}
        isLoading={deleteTimelineLoading}
        title="O'chirishni tasdiqlaysizmi?"
        description="Bu hodisa butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
}
