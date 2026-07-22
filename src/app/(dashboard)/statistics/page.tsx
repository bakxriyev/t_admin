"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { statisticSchema, type StatisticFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { FormLanguageSwitcher } from "@/components/shared/FormLanguageSwitcher";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loader2, Plus, Save, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { type Statistic } from "@/types";

export default function StatisticsPage() {
  const { formLang } = useLanguage();
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<StatisticFormData>({
    resolver: zodResolver(statisticSchema),
    defaultValues: { is_active: true, order: 0, value: 0 },
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/api/statistics");
      setStats(res.data.data || []);
    } catch { toast.error("Yuklashda xatolik"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data: StatisticFormData) => {
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/statistics/${editingId}`, data);
        toast.success("Statistika yangilandi");
      } else {
        await api.post("/api/statistics", data);
        toast.success("Statistika qo'shildi");
      }
      reset({ is_active: true, order: 0, value: 0 });
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally { setSaving(false); }
  };

  const handleEdit = (item: Statistic) => {
    setEditingId(item.id);
    reset({
      label_uz: item.label_uz,
      label_ru: item.label_ru,
      label_en: item.label_en,
      value: item.value,
      order: item.order,
      is_active: item.is_active,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/statistics/${deleteId}`);
      toast.success("Statistika o'chirildi");
      fetchData();
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setDeleteLoading(false); setDeleteId(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistika</h1>
        <p className="text-muted-foreground mt-1">Statistika ko'rsatkichlarini boshqarish</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Statistikani tahrirlash" : "Yangi statistika"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-end">
                <FormLanguageSwitcher />
              </div>
              {["uz", "ru", "en"].map((l) => (
                <div key={l} className="space-y-2" style={{ display: l === formLang ? "block" : "none" }}>
                  <Label>Label ({l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English"})</Label>
                  <Input {...register(`label_${l}` as any)} placeholder="Label" />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Qiymat</Label>
                <Input type="number" {...register("value", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Tartib</Label>
                <Input type="number" {...register("order", { valueAsNumber: true })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register("is_active")} className="h-4 w-4" />
                <Label className="mb-0">Faol</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda</> : <><Save className="mr-2 h-4 w-4" /> {editingId ? "Yangilash" : "Qo'shish"}</>}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { reset({ is_active: true, order: 0, value: 0 }); setEditingId(null); }}>
                    Bekor qilish
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mavjud statistikalar</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.length === 0 && (
                <p className="text-sm text-muted-foreground">Hech qanday statistika yo'q</p>
              )}
              {stats.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{item.label_uz}</p>
                    <p className="text-sm text-muted-foreground">Qiymat: {item.value}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {item.is_active ? "Faol" : "No faol"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmModal open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} onConfirm={handleDelete} isLoading={deleteLoading} />
    </div>
  );
}
