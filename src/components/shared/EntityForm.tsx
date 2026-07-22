"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LanguageTabs } from "./LanguageTabs";
import { FormLanguageSwitcher } from "./FormLanguageSwitcher";
import { ImageUpload } from "./ImageUpload";
import { VideoUpload } from "./VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Copy } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { type ZodSchema } from "zod";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "email" | "url" | "file" | "boolean" | "multilang" | "multilang-textarea";
  placeholder?: string;
  options?: { value: string; label: string }[];
  lang?: string;
  required?: boolean;
}

interface EntityFormProps {
  schema: ZodSchema;
  apiEndpoint: string;
  redirectPath: string;
  title: string;
  editTitle: string;
  fields: FieldConfig[];
  isEdit?: boolean;
}

const MULTILANG_SUFFIXES = ["_uz", "_ru", "_en"];
const LANG_LABELS: Record<string, string> = { uz: "O'zbek", ru: "Русский", en: "English" };

export function EntityForm({
  schema,
  apiEndpoint,
  redirectPath,
  title,
  editTitle,
  fields,
  isEdit = false,
}: EntityFormProps) {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [fileValues, setFileValues] = useState<Record<string, File | null>>({});
  const initialDataRef = useRef<any>(null);

  const [missingFields, setMissingFields] = useState<{ label: string; filledLang: string; emptyLangs: string[] }[]>([]);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const pendingDataRef = useRef<any>(null);

  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isEdit && params?.id) {
      const fetchData = async () => {
        try {
          const res = await api.get(`${apiEndpoint}/${params.id}`);
          const data = res.data.data || res.data;
          initialDataRef.current = data;
          const formData: any = {};
          fields.forEach((f) => {
            if (f.type === "multilang" || f.type === "multilang-textarea") {
              MULTILANG_SUFFIXES.forEach((suffix) => {
                formData[`${f.name}${suffix}`] = data[`${f.name}${suffix}`] ?? "";
              });
            } else if (f.type !== "file") {
              formData[f.name] = data[f.name] ?? "";
            }
          });
          reset(formData);
        } catch {
          toast.error("Ma'lumotni yuklashda xatolik");
        } finally {
          setPageLoading(false);
        }
      };
      fetchData();
    }
  }, [params?.id, isEdit, apiEndpoint, JSON.stringify(fields)]);

  const handleFileChange = (name: string, file: File | null) => {
    setFileValues((prev) => ({ ...prev, [name]: file }));
  };

  const checkMultilangFields = (data: any) => {
    const missing: { label: string; filledLang: string; emptyLangs: string[] }[] = [];
    const langKeys = MULTILANG_SUFFIXES.map((s) => s.replace("_", ""));

    fields.forEach((f) => {
      if (f.type !== "multilang" && f.type !== "multilang-textarea") return;

      const filled: string[] = [];
      const empty: string[] = [];

      langKeys.forEach((lang) => {
        const val = data[`${f.name}_${lang}`];
        if (val && String(val).trim()) {
          filled.push(lang);
        } else {
          empty.push(lang);
        }
      });

      if (filled.length > 0 && empty.length > 0) {
        missing.push({
          label: f.label,
          filledLang: filled[0],
          emptyLangs: empty,
        });
      }
    });

    return missing;
  };

  const doSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const hasFile = fields.some((f) => f.type === "file");
      let res;

      if (hasFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        Object.entries(fileValues).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });

        if (isEdit && params?.id) {
          res = await api.put(`${apiEndpoint}/${params.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await api.post(apiEndpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        if (isEdit && params?.id) {
          res = await api.put(`${apiEndpoint}/${params.id}`, data);
        } else {
          res = await api.post(apiEndpoint, data);
        }
      }

      toast.success(res.data?.message || (isEdit ? "Yangilandi" : "Qo'shildi"));
      router.push(redirectPath);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    const missing = checkMultilangFields(data);

    if (missing.length > 0) {
      pendingDataRef.current = data;
      setMissingFields(missing);
      setShowLangDialog(true);
      return;
    }

    await doSubmit(data);
  };

  const handleAutoFill = async () => {
    const data = pendingDataRef.current;

    missingFields.forEach(({ label: fieldLabel, filledLang, emptyLangs }) => {
      const field = fields.find((f) => f.label === fieldLabel);
      if (!field) return;
      const filledValue = data[`${field.name}_${filledLang}`];
      emptyLangs.forEach((lang) => {
        data[`${field.name}_${lang}`] = filledValue;
        setValue(`${field.name}_${lang}`, filledValue);
      });
    });

    setShowLangDialog(false);
    setMissingFields([]);
    pendingDataRef.current = null;

    await doSubmit(data);
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderField = (field: FieldConfig) => {
    const err = (errors as any)[field.name];

    if (field.type === "multilang" || field.type === "multilang-textarea") {
      const isTextarea = field.type === "multilang-textarea";
      return (
        <LanguageTabs key={field.name}>
          {(lang) => (
            <div className="space-y-2">
              <Label>{field.label} ({LANG_LABELS[lang]})</Label>
              {isTextarea ? (
                <Textarea {...register(`${field.name}_${lang}`)} rows={5} placeholder={`${field.placeholder || ""}`} />
              ) : (
                <Input {...register(`${field.name}_${lang}`)} placeholder={`${field.placeholder || ""}`} />
              )}
              {(errors as any)[`${field.name}_${lang}`] && (
                <p className="text-sm text-destructive">{(errors as any)[`${field.name}_${lang}`]?.message}</p>
              )}
            </div>
          )}
        </LanguageTabs>
      );
    }

    if (field.type === "select") {
      return (
        <div className="space-y-2" key={field.name}>
          <Label>{field.label}</Label>
          <Select value={watch(field.name)} onValueChange={(v) => setValue(field.name, v)}>
            <SelectTrigger><SelectValue placeholder={field.placeholder} /></SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err && <p className="text-sm text-destructive">{err.message}</p>}
        </div>
      );
    }

    if (field.type === "file") {
      const existingUrl = isEdit && initialDataRef.current ? initialDataRef.current[field.name] : null;
      const isVideo = field.name === "video";
      return (
        <div className="space-y-2" key={field.name}>
          <Label>{field.label}</Label>
          {isVideo ? (
            <VideoUpload
              value={existingUrl}
              onChange={(file) => handleFileChange(field.name, file)}
            />
          ) : (
            <ImageUpload
              value={existingUrl}
              onChange={(file) => handleFileChange(field.name, file)}
            />
          )}
        </div>
      );
    }

    if (field.type === "boolean") {
      return (
        <div className="flex items-center gap-2" key={field.name}>
          <input
            type="checkbox"
            {...register(field.name)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label className="mb-0">{field.label}</Label>
        </div>
      );
    }

    const inputType = field.type === "number" ? "number" : field.type === "email" ? "email" : "text";
    return (
      <div className="space-y-2" key={field.name}>
        <Label>{field.label}</Label>
        <Input
          type={inputType}
          {...register(field.name, field.type === "number" ? { valueAsNumber: true } : undefined)}
          placeholder={field.placeholder}
        />
        {err && <p className="text-sm text-destructive">{err.message}</p>}
      </div>
    );
  };

  const currentTitle = isEdit ? editTitle : title;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(redirectPath)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{currentTitle}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <FormLanguageSwitcher />
        </div>
        <Card>
          <CardHeader><CardTitle>{currentTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {fields.map(renderField)}
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
          <Button variant="outline" type="button" onClick={() => router.push(redirectPath)}>Bekor qilish</Button>
        </div>
      </form>

      <AlertDialog open={showLangDialog} onOpenChange={setShowLangDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-primary" />
              Ko'p tilli maydonlar
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Quyidagi maydonlar barcha tillarda to'ldirilmagan:</p>
              <ul className="list-disc pl-5 space-y-1">
                {missingFields.map((mf, i) => (
                  <li key={i} className="text-sm">
                    <strong>{mf.label}</strong> —{" "}
                    <span className="text-muted-foreground">
                      {LANG_LABELS[mf.filledLang]} to'ldirilgan,{" "}
                      {mf.emptyLangs.map((l) => LANG_LABELS[l]).join(", ")} bo'sh
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium text-foreground">
                Bitta tilda kiritilgan ma'lumotni qolgan tillarga avtomatik nusxalashni xohlaysizmi?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLangDialog(false)}>
              Yo'q, men o'zim to'ldiraman
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAutoFill}>
              Ha, nusxalash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
