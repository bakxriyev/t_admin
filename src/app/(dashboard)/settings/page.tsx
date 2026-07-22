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
  Loader2, Save, Plus, Trash2, Pencil, Globe, Phone, MapPin, Image, Settings2,
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Sozlamalar</h1>
          <p className="text-muted-foreground mt-1">Sayt sozlamalarini boshqaring</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <FormLanguageSwitcher />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sayt nomi */}
          <div className="md:col-span-2 card-3d">
            <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="icon-3d rounded-xl p-2.5 shrink-0">
                  <Globe className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sayt nomi</h3>
                  <p className="text-sm text-muted-foreground">Tilni tanlang va kiriting</p>
                </div>
              </div>
              {["uz", "ru", "en"].map((l) => (
                <div key={l} className="space-y-2" style={{ display: l === formLang ? "block" : "none" }}>
                  <Label className="text-muted-foreground">Sayt nomi ({l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English"})</Label>
                  <Input
                    {...register(`site_name_${l}` as any)}
                    className="bg-background/50"
                    placeholder="Sayt nomi"
                  />
                  {(errors as any)[`site_name_${l}`] && (
                    <p className="text-xs text-destructive">{(errors as any)[`site_name_${l}`]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Logo va Favicon */}
          <div className="card-3d">
            <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="icon-3d rounded-xl p-2.5 shrink-0">
                  <Image className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Logo & Favicon</h3>
                  <p className="text-sm text-muted-foreground">Rasm yuklang</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Logo</Label>
                  <div className="glass-card rounded-xl p-3 flex items-center justify-center min-h-[120px]">
                    <ImageUpload value={initialData?.logo} onChange={setLogo} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Favicon</Label>
                  <div className="glass-card rounded-xl p-3 flex items-center justify-center min-h-[120px]">
                    <ImageUpload value={initialData?.favicon} onChange={setFavicon} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kontaktlar */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-3d rounded-xl p-2.5 shrink-0">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Kontaktlar</h3>
                <p className="text-sm text-muted-foreground">Email, telefon va ish vaqti</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email <span className="text-destructive">*</span></Label>
                  <Input
                    {...register("email")}
                    type="email"
                    className="bg-background/50"
                    placeholder="info@tashkentlawschool.uz"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Telefon <span className="text-destructive">*</span></Label>
                  <Input
                    {...register("phone")}
                    className="bg-background/50"
                    placeholder="+998 71 200 00 00"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
              </div>
              {["uz", "ru", "en"].map((l) => (
                <div key={l} className="space-y-2" style={{ display: l === formLang ? "block" : "none" }}>
                  <Label className="text-muted-foreground">Ish vaqti ({l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English"})</Label>
                  <Input
                    {...register(`working_hours_${l}` as any)}
                    className="bg-background/50"
                    placeholder="Du-Ju 09:00 - 18:00"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manzil */}
        <div className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-3d rounded-xl p-2.5 shrink-0">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Manzil</h3>
                <p className="text-sm text-muted-foreground">3 tilda kiriting</p>
              </div>
            </div>
            {["uz", "ru", "en"].map((l) => (
              <div key={l} className="space-y-2" style={{ display: l === formLang ? "block" : "none" }}>
                <Label className="text-muted-foreground">Manzil ({l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English"}) <span className="text-destructive">*</span></Label>
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

        {/* Save button */}
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
        <div className="card-3d-inner glass-card card-shine rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="icon-3d rounded-xl p-2.5 shrink-0">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ijtimoiy tarmoqlar</h3>
              <p className="text-sm text-muted-foreground">Havolalarni boshqaring</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2 flex-1 min-w-[150px]">
              <Label className="text-muted-foreground text-xs">Platforma</Label>
              <Input
                placeholder="Instagram"
                value={socialForm.platform}
                onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2 flex-[2] min-w-[200px]">
              <Label className="text-muted-foreground text-xs">URL</Label>
              <Input
                placeholder="https://instagram.com/..."
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2 w-20">
              <Label className="text-muted-foreground text-xs">Tartib</Label>
              <Input
                type="number"
                placeholder="0"
                value={socialForm.order}
                onChange={(e) => setSocialForm({ ...socialForm, order: Number(e.target.value) })}
                className="bg-background/50"
              />
            </div>
            <Button type="button" onClick={handleSocialSubmit} disabled={socialSaving} className="btn-3d mb-0.5">
              {socialSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSocialId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingSocialId ? "Yangilash" : "Qo'shish"}
            </Button>
            {editingSocialId && (
              <Button type="button" variant="outline" size="sm" onClick={() => {
                setEditingSocialId(null);
                setSocialForm({ platform: "", url: "", order: 0 });
              }}>
                Bekor qilish
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {socialLinks.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-muted-foreground text-sm">Havolalar yo'q</div>
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
