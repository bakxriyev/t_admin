"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageTabs } from "@/components/shared/LanguageTabs";
import { FormLanguageSwitcher } from "@/components/shared/FormLanguageSwitcher";
import { Loader2, Save, Plus, Pencil, Trash2, X, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type FaqItem = { id: number; question_uz: string; question_ru: string; question_en: string; answer_uz: string; answer_ru: string; answer_en: string; order: number };

const LANG_LABELS: Record<string, string> = { uz: "O'zbek", ru: "Русский", en: "English" };

export default function FaqPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [editMap, setEditMap] = useState<Record<number, FaqItem>>({});
  const [newItem, setNewItem] = useState<Partial<FaqItem> | null>(null);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/api/faq")
      .then((res) => {
        const data = res.data.data || res.data || [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Ma'lumotlarni yuklashda xatolik"))
      .finally(() => setPageLoading(false));
  }, []);

  const startEdit = (item: FaqItem) => {
    setEditMap((prev) => ({ ...prev, [item.id]: { ...item } }));
  };

  const cancelEdit = (id: number) => {
    setEditMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEdit = (id: number, field: string, value: string) => {
    setEditMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveItem = async (id: number) => {
    setSavingId(id);
    try {
      const data = editMap[id];
      await api.put(`/api/faq/${id}`, data);
      setItems((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
      cancelEdit(id);
      toast.success("Saqlanib qoldi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSavingId(null); }
  };

  const saveNew = async () => {
    if (!newItem?.question_uz) { toast.error("Savol (O'zbek) majburiy"); return; }
    if (!newItem?.answer_uz) { toast.error("Javob (O'zbek) majburiy"); return; }
    setSavingId('new');
    try {
      const res = await api.post("/api/faq", { ...newItem, order: newItem.order ?? items.length + 1 });
      const created = res.data.data || res.data;
      setItems((prev) => [...prev, created].sort((a, b) => (a.order || 0) - (b.order || 0)));
      setNewItem(null);
      toast.success("Qo'shildi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSavingId(null); }
  };

  const deleteItem = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/faq/${id}`);
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success("O'chirildi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setDeletingId(null); }
  };

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

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ko'p beriladigan savollar</h1>
        <p className="text-muted-foreground mt-1">FAQ bo'limi savol-javoblari</p>
      </div>

      <div className="flex justify-end">
        <FormLanguageSwitcher />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Savol-javoblar</CardTitle>
          <Button size="sm" onClick={() => setNewItem({ question_uz: "", question_ru: "", question_en: "", answer_uz: "", answer_ru: "", answer_en: "", order: items.length + 1 })}>
            <Plus className="mr-1 h-4 w-4" /> Yangi qo'shish
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 && !newItem && <p className="text-muted-foreground">Hozircha savol-javoblar yo'q</p>}

          {newItem && (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Yangi savol-javob</h3>
                <Button variant="ghost" size="sm" onClick={() => setNewItem(null)}><X className="h-4 w-4" /></Button>
              </div>
              {renderMultilangFields("Savol", "question", newItem, (f, val) => setNewItem((prev) => ({ ...prev!, [f]: val })))}
              {renderMultilangFields("Javob", "answer", newItem, (f, val) => setNewItem((prev) => ({ ...prev!, [f]: val })), true)}
              <Button onClick={saveNew} disabled={savingId === 'new'} size="sm">
                {savingId === 'new' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Saqlash
              </Button>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg truncate">
                  {editMap[item.id] ? "Tahrirlash" : item.question_uz || item.question_en}
                </h3>
                <div className="flex gap-1 shrink-0">
                  {editMap[item.id] ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => saveItem(item.id)} disabled={savingId === item.id}>
                        {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cancelEdit(item.id)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)} disabled={deletingId === item.id}>
                        {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editMap[item.id] ? (
                <div className="space-y-3">
                  {renderMultilangFields("Savol", "question", editMap[item.id], (f, val) => updateEdit(item.id, f, val))}
                  {renderMultilangFields("Javob", "answer", editMap[item.id], (f, val) => updateEdit(item.id, f, val), true)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div><span className="font-medium">UZ:</span> {item.question_uz}</div>
                  <div className="text-muted-foreground text-xs">{item.answer_uz}</div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
