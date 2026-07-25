"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { FormLanguageSwitcher } from "@/components/shared/FormLanguageSwitcher";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  Loader2, Save, Plus, Trash2, Pencil, Globe, Phone, MapPin, Settings2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { type SocialLink } from "@/types";

const settingsSchema = z.object({
  site_name_uz: z.string().min(1, "Majburiy"),
  site_name_ru: z.string().min(1, "Обязательно"),
  site_name_en: z.string().min(1, "Required"),
  email: z.string().email("Noto'g'ri email"),
  phone: z.string().min(1, "Majburiy"),
  address_uz: z.string().min(1, "Majburiy"),
  address_ru: z.string().min(1, "Обязательно"),
  address_en: z.string().min(1, "Required"),
  working_hours_uz: z.string().optional(),
  working_hours_ru: z.string().optional(),
  working_hours_en: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function LangLabel({ l }: { l: string }) {
  return l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English";
}

export default function SettingsPage() {
  const { formLang } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialForm, setSocialForm] = useState({ platform: "", url: "", order: 0 });
  const [editingSocialId, setEditingSocialId] = useState<number | null>(null);
  const [socialSaving, setSocialSaving] = useState(false);
  const [deleteSocialId, setDeleteSocialId] = useState<number | null>(null);
  const [deleteSocialLoading, setDeleteSocialLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/settings");
        const data = res.data.data || res.data;
        setInitialData(data);
        reset({
          site_name_uz: data.site_name_uz || "",
          site_name_ru: data.site_name_ru || "",
          site_name_en: data.site_name_en || "",
          email: data.email || "",
          phone: data.phone || "",
          address_uz: data.address_uz || "",
          address_ru: data.address_ru || "",
          address_en: data.address_en || "",
          working_hours_uz: data.working_hours_uz || "",
          working_hours_ru: data.working_hours_ru || "",
          working_hours_en: data.working_hours_en || "",
        });
      } catch { toast.error("Ma'lumotlarni yuklashda xatolik"); }
      finally { setPageLoading(false); }
    };
    fetchData();
    fetchSocialLinks();
  }, [reset]);

  const fetchSocialLinks = async () => {
    try { const res = await api.get("/api/social-links"); setSocialLinks(res.data.data || []); }
    catch {}
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value as string));
      if (logo) formData.append("logo", logo);
      if (favicon) formData.append("favicon", favicon);
      await api.put("/api/settings", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Sozlamalar saqlandi");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally { setIsLoading(false); }
  };

  const handleSocialSubmit = async () => {
    if (!socialForm.platform || !socialForm.url) return;
    setSocialSaving(true);
    try {
      if (editingSocialId) {
        await api.put(`/api/social-links/${editingSocialId}`, socialForm);
        toast.success("Yangilandi");
      } else {
        await api.post("/api/social-links", socialForm);
        toast.success("Qo'shildi");
      }
      setSocialForm({ platform: "", url: "", order: 0 });
      setEditingSocialId(null);
      fetchSocialLinks();
    } catch { toast.error("Xatolik"); }
    finally { setSocialSaving(false); }
  };

  const handleSocialEdit = (link: SocialLink) => {
    setEditingSocialId(link.id);
    setSocialForm({ platform: link.platform, url: link.url, order: link.order });
  };

  const handleSocialDelete = async () => {
    if (!deleteSocialId) return;
    setDeleteSocialLoading(true);
    try {
      await api.delete(`/api/social-links/${deleteSocialId}`);
      toast.success("O'chirildi");
      fetchSocialLinks();
    } catch { toast.error("Xatolik"); }
    finally { setDeleteSocialLoading(false); setDeleteSocialId(null); }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Sozlamalar</h1>
          <p className="text-muted-foreground mt-1">Sayt sozlamalarini boshqaring</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <FormLanguageSwitcher />
        </div>

        {/* Sayt nomi + Logo/Favicon */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-3d rounded-xl p-2.5 shrink-0">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Sayt nomi</h3>
                <p className="text-sm text-muted-foreground">3 tilda kiriting</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 grid gap-4">
                {["uz", "ru", "en"].map((l) => (
                  <div key={l} className="space-y-1.5" style={{ display: l === formLang ? "block" : "none" }}>
                    <Label className="text-muted-foreground text-sm"><LangLabel l={l} /></Label>
                    <Input
                      {...register(`site_name_${l}` as any)}
                      className="bg-background/50"
                      placeholder={`Sayt nomi (${LangLabel({ l })}`}
                    />
                    {(errors as any)[`site_name_${l}`] && (
                      <p className="text-xs text-destructive">{(errors as any)[`site_name_${l}`]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 md:flex-col md:gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-muted-foreground text-sm">Logo</Label>
                  <div className="glass-card rounded-xl p-2 flex items-center justify-center min-h-[90px]">
                    <ImageUpload value={initialData?.logo} onChange={setLogo} />
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-muted-foreground text-sm">Favicon</Label>
                  <div className="glass-card rounded-xl p-2 flex items-center justify-center min-h-[90px]">
                    <ImageUpload value={initialData?.favicon} onChange={setFavicon} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kontakt + Manzil */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-3d rounded-xl p-2.5 shrink-0">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Kontaktlar</h3>
                <p className="text-sm text-muted-foreground">Email, telefon, ish vaqti va manzil</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    className="bg-background/50"
                    placeholder="info@tashkentlawschool.uz"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-sm">Telefon</Label>
                  <Input
                    {...register("phone")}
                    className="bg-background/50"
                    placeholder="+998 71 200 00 00"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                {["uz", "ru", "en"].map((l) => (
                  <div key={l} className="space-y-1.5" style={{ display: l === formLang ? "block" : "none" }}>
                    <Label className="text-muted-foreground text-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Ish vaqti (<LangLabel l={l} />)
                    </Label>
                    <Input
                      {...register(`working_hours_${l}` as any)}
                      className="bg-background/50"
                      placeholder="Du-Ju 09:00 - 18:00"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {["uz", "ru", "en"].map((l) => (
                  <div key={l} className="space-y-1.5" style={{ display: l === formLang ? "block" : "none" }}>
                    <Label className="text-muted-foreground text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Manzil (<LangLabel l={l} />)
                    </Label>
                    <Textarea
                      {...register(`address_${l}` as any)}
                      className="bg-background/50 min-h-[80px]"
                      rows={3}
                      placeholder="Manzil"
                    />
                    {(errors as any)[`address_${l}`] && (
                      <p className="text-xs text-destructive">{(errors as any)[`address_${l}`]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="btn-3d px-8">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Barcha sozlamalarni saqlash</>
            )}
          </Button>
        </div>
      </form>

      {/* Ijtimoiy tarmoqlar */}
      <div className="card-3d">
        <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="icon-3d rounded-xl p-2.5 shrink-0">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ijtimoiy tarmoqlar</h3>
              <p className="text-sm text-muted-foreground">Havolalarni boshqaring</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2.5">
            <div className="space-y-1 flex-1 min-w-[140px]">
              <Label className="text-muted-foreground text-xs">Platforma</Label>
              <Input
                placeholder="Telegram"
                value={socialForm.platform}
                onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                className="bg-background/50 h-9 text-sm"
              />
            </div>
            <div className="space-y-1 flex-[2] min-w-[180px]">
              <Label className="text-muted-foreground text-xs">URL</Label>
              <Input
                placeholder="https://t.me/..."
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                className="bg-background/50 h-9 text-sm"
              />
            </div>
            <div className="space-y-1 w-16">
              <Label className="text-muted-foreground text-xs">Tartib</Label>
              <Input
                type="number"
                placeholder="0"
                value={socialForm.order}
                onChange={(e) => setSocialForm({ ...socialForm, order: Number(e.target.value) })}
                className="bg-background/50 h-9 text-sm"
              />
            </div>
            <Button type="button" onClick={handleSocialSubmit} disabled={socialSaving} className="btn-3d h-9 mb-0.5 px-4 text-sm">
              {socialSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : editingSocialId ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingSocialId ? "Yangilash" : "Qo'shish"}
            </Button>
            {editingSocialId && (
              <Button type="button" variant="outline" size="sm" className="h-9 text-sm" onClick={() => {
                setEditingSocialId(null);
                setSocialForm({ platform: "", url: "", order: 0 });
              }}>
                Bekor qilish
              </Button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {socialLinks.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">Havolalar yo'q</div>
            ) : (
              socialLinks.map((link) => (
                <div key={link.id} className="group flex items-center justify-between p-3 rounded-xl glass-card hover:scale-[1.01] transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {link.platform.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{link.platform}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSocialEdit(link)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => setDeleteSocialId(link.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal open={!!deleteSocialId} onOpenChange={(o) => { if (!o) setDeleteSocialId(null); }} onConfirm={handleSocialDelete} isLoading={deleteSocialLoading} />
    </div>
  );
}
