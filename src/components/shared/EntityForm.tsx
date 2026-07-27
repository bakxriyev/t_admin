"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef, useCallback } from "react";
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
import { MultiImageUpload } from "./MultiImageUpload";
import { VideoUpload } from "./VideoUpload";
import { UploadProgressBar, type UploadFileStatus } from "./UploadProgressBar";
import { compressImages, formatSize } from "@/lib/imageCompression";
import { Loader2, ArrowLeft, Save, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { type ZodSchema } from "zod";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "email" | "url" | "file" | "multi-file" | "boolean" | "multilang" | "multilang-textarea";
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
  const [fileValues, setFileValues] = useState<Record<string, File[] | File | null>>({});
  const initialDataRef = useRef<any>(null);
  const [initialImage, setInitialImage] = useState<Record<string, string | string[] | null>>({});

  const [missingFields, setMissingFields] = useState<{ label: string; filledLang: string; emptyLangs: string[] }[]>([]);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const pendingDataRef = useRef<any>(null);

  const [uploadStatuses, setUploadStatuses] = useState<UploadFileStatus[]>([]);
  const [uploadStep, setUploadStep] = useState<"compressing" | "uploading" | "done">("compressing");
  const [overallProgress, setOverallProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

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
          const imgs: Record<string, string | null> = {};
          fields.forEach((f) => {
            if (f.type === "multilang" || f.type === "multilang-textarea") {
              MULTILANG_SUFFIXES.forEach((suffix) => {
                formData[`${f.name}${suffix}`] = data[`${f.name}${suffix}`] ?? "";
              });
            } else if (f.type === "file" || f.type === "multi-file") {
              imgs[f.name] = data[f.name] || (f.type === "multi-file" ? [] : null);
            } else if (f.type === "select") {
              formData[f.name] = data[f.name] ?? (f.options?.[0]?.value || "");
            } else if (f.type === "boolean") {
              formData[f.name] = data[f.name] ?? true;
            } else {
              formData[f.name] = data[f.name] ?? (f.type === "number" ? 0 : "");
            }
          });
          setInitialImage(imgs);
          reset(formData);
        } catch {
          toast.error("Ma'lumotni yuklashda xatolik");
        } finally {
          setPageLoading(false);
        }
      };
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, isEdit, apiEndpoint]);

  const handleFileChange = (name: string, file: File | File[] | null) => {
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

  const buildStatuses = (files: File[]): UploadFileStatus[] => {
    return files.map((f) => ({
      name: f.name,
      originalSize: formatSize(f.size),
      compressedSize: formatSize(f.size),
      status: "pending" as const,
      progress: 0,
    }));
  };

  const doSubmit = async (data: any) => {
    setIsLoading(true);
    const hasMultiFile = fields.some((f) => f.type === "multi-file");
    const hasFile = fields.some((f) => f.type === "file" || f.type === "multi-file");

    try {
      if (hasMultiFile) {
        const multiField = fields.find((f) => f.type === "multi-file");
        if (!multiField) throw new Error("multi-file field not found");

        const rawFiles = fileValues[multiField.name];
        const files = Array.isArray(rawFiles) ? rawFiles : rawFiles ? [rawFiles] : [];

        if (files.length > 0) {
          const statuses = buildStatuses(files);
          setUploadStatuses(statuses);
          setUploadStep("compressing");
          setOverallProgress(0);
          setShowProgress(true);

          const compressed = await compressImages(files, (current, total, result) => {
            setUploadStatuses((prev) => {
              const updated = [...prev];
              updated[current - 1] = {
                ...updated[current - 1],
                originalSize: formatSize(result.originalSize),
                compressedSize: formatSize(result.compressedSize),
                status: "compressed",
              };
              return updated;
            });
            setOverallProgress((current / total) * 50);
          });

          setUploadStep("uploading");
          setUploadStatuses((prev) => prev.map((s) => ({ ...s, status: "uploading" })));

          const allFiles = compressed.map((c) => c.file);

          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              formData.append(key, String(value));
            }
          });

          Object.entries(fileValues).forEach(([key, file]) => {
            if (!file) return;
            if (Array.isArray(rawFiles) && key === multiField.name) {
              allFiles.forEach((f) => {
                formData.append(`${key}[]`, f);
              });
            } else if (!Array.isArray(file)) {
              formData.append(key, file);
            }
          });

          let res;
          if (isEdit && params?.id) {
            res = await api.put(`${apiEndpoint}/${params.id}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                  setOverallProgress(50 + pct / 2);
                  setUploadStatuses((prev) =>
                    prev.map((s) => ({
                      ...s,
                      progress: pct,
                    }))
                  );
                }
              },
            });
          } else {
            res = await api.post(apiEndpoint, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                  setOverallProgress(50 + pct / 2);
                  setUploadStatuses((prev) =>
                    prev.map((s) => ({
                      ...s,
                      progress: pct,
                    }))
                  );
                }
              },
            });
          }

          setOverallProgress(100);
          setUploadStatuses((prev) => prev.map((s) => ({ ...s, status: "done", progress: 100 })));
          setUploadStep("done");
          await new Promise((r) => setTimeout(r, 600));

          setShowProgress(false);
          toast.success(res.data?.message || (isEdit ? "Yangilandi" : "Qo'shildi"));
          router.push(redirectPath);
          return;
        }
      }

      if (hasFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        });
        Object.entries(fileValues).forEach(([key, file]) => {
          if (!file) return;
          if (Array.isArray(file)) {
            file.forEach((f) => {
              if (f) formData.append(`${key}[]`, f);
            });
          } else {
            formData.append(key, file);
          }
        });

        let res;
        if (isEdit && params?.id) {
          res = await api.put(`${apiEndpoint}/${params.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await api.post(apiEndpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        toast.success(res.data?.message || (isEdit ? "Yangilandi" : "Qo'shildi"));
      } else {
        const cleanData = { ...data };
        Object.keys(cleanData).forEach((key) => {
          if (cleanData[key] === "" && key !== "is_active") cleanData[key] = undefined;
        });
        let res;
        if (isEdit && params?.id) {
          res = await api.put(`${apiEndpoint}/${params.id}`, cleanData);
        } else {
          res = await api.post(apiEndpoint, cleanData);
        }
        toast.success(res.data?.message || (isEdit ? "Yangilandi" : "Qo'shildi"));
      }

      router.push(redirectPath);
    } catch (error: any) {
      const msg = error.response?.status === 413
        ? "Fayllar juda katta! Iltimos kamroq rasm tanlang yoki kichikroq rasmlar yuklang."
        : (error.response?.data?.message || "Xatolik yuz berdi");
      toast.error(msg);

      setUploadStatuses((prev) => prev.map((s) => ({ ...s, status: "error" as const })));
      setShowProgress(false);
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

  const requiredMultilangFields = fields.filter(
    (f) => (f.type === "multilang" || f.type === "multilang-textarea")
  );
  const requiredSimpleFields = fields.filter(
    (f) => f.type !== "multilang" && f.type !== "multilang-textarea" && f.type !== "file" && f.type !== "multi-file" && f.type !== "boolean"
  );
  const fileFields = fields.filter((f) => f.type === "file" || f.type === "multi-file");
  const booleanFields = fields.filter((f) => f.type === "boolean");

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const currentTitle = isEdit ? editTitle : title;

  const renderField = (field: FieldConfig) => {
    if (field.type === "multilang" || field.type === "multilang-textarea") {
      const isTextarea = field.type === "multilang-textarea";
      return (
        <div key={field.name} className="card-3d">
          <div className="card-3d-inner glass-card card-shine rounded-2xl p-5 md:p-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="icon-3d rounded-lg p-1.5 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6"/><path d="M13 14l6-6"/><path d="M4 4h16v16H4z"/></svg>
              </span>
              <div>
                <h3 className="font-semibold text-base">{field.label}</h3>
                <p className="text-xs text-muted-foreground">Barcha tillarda to'ldiring (O'zbek, Русский, English)</p>
              </div>
              {field.required !== false && (
                <span className="ml-auto text-xs text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-full">Majburiy</span>
              )}
            </div>
            <LanguageTabs>
              {(lang) => (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">
                    {field.label} ({LANG_LABELS[lang]})
                  </Label>
                  {isTextarea ? (
                    <Textarea
                      {...register(`${field.name}_${lang}`)}
                      rows={5}
                      placeholder={`${field.placeholder || field.label} (${LANG_LABELS[lang]})`}
                      className="bg-background/50 resize-y min-h-[100px]"
                    />
                  ) : (
                    <Input
                      {...register(`${field.name}_${lang}`)}
                      placeholder={`${field.placeholder || field.label} (${LANG_LABELS[lang]})`}
                      className="bg-background/50"
                    />
                  )}
                  {(errors as any)[`${field.name}_${lang}`] && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {(errors as any)[`${field.name}_${lang}`]?.message}
                    </p>
                  )}
                </div>
              )}
            </LanguageTabs>
          </div>
        </div>
      );
    }

    if (field.type === "select") {
      const err = (errors as any)[field.name];
      return (
        <div className="space-y-2" key={field.name}>
          <Label className="text-muted-foreground text-sm">{field.label}</Label>
          <Select value={watch(field.name)} onValueChange={(v) => setValue(field.name, v)}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err && <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" />{err.message}</p>}
        </div>
      );
    }

    if (field.type === "file" || field.type === "multi-file") {
      const existingUrl = initialImage[field.name] || (initialDataRef.current ? initialDataRef.current[field.name] : null);
      const isVideo = field.name === "video";
      const isMulti = field.type === "multi-file";
      return (
        <div className="space-y-2" key={field.name}>
          <Label className="text-muted-foreground text-sm">{field.label}</Label>
          <div className="glass-card rounded-xl p-3">
            {isVideo ? (
              <VideoUpload
                value={existingUrl as string}
                onChange={(file) => handleFileChange(field.name, file)}
              />
            ) : isMulti ? (
              <MultiImageUpload
                value={Array.isArray(existingUrl) ? existingUrl : (existingUrl ? [existingUrl] : [])}
                onChange={(files) => handleFileChange(field.name, files)}
              />
            ) : (
              <ImageUpload
                value={existingUrl as string}
                onChange={(file) => handleFileChange(field.name, file)}
              />
            )}
          </div>
        </div>
      );
    }

    if (field.type === "boolean") {
      return (
        <label key={field.name} className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              {...register(field.name)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium">{field.label}</span>
        </label>
      );
    }

    const inputType = field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text";
    const err = (errors as any)[field.name];
    return (
      <div className="space-y-2" key={field.name}>
        <Label className="text-muted-foreground text-sm">{field.label}</Label>
        <Input
          type={inputType}
          {...register(field.name, field.type === "number" ? { valueAsNumber: true } : undefined)}
          placeholder={field.placeholder}
          className="bg-background/50"
        />
        {err && <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" />{err.message}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(redirectPath)}
          className="icon-3d rounded-xl p-2 hover:scale-110 transition-transform"
        >
          <ArrowLeft className="h-5 w-5 text-primary-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">{currentTitle}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isEdit ? "Mavjud yozuvni tahrirlash" : "Yangi yozuv qo'shish"} — barcha tillarda to'ldiring
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <FormLanguageSwitcher />
        </div>

        {/* Multilang fields */}
        {requiredMultilangFields.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Asosiy ma'lumotlar</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {requiredMultilangFields.length} ta ko'p tilli maydon
              </span>
            </div>
            {requiredMultilangFields.map(renderField)}
          </div>
        )}

        {/* Simple fields */}
        {(requiredSimpleFields.length > 0 || fileFields.length > 0 || booleanFields.length > 0) && (
          <div className="card-3d">
            <div className="card-3d-inner glass-card card-shine rounded-2xl p-5 md:p-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="icon-3d rounded-lg p-1.5 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                </span>
                <div>
                  <h3 className="font-semibold text-base">Qo'shimcha ma'lumotlar</h3>
                  <p className="text-xs text-muted-foreground">URL, tartib raqami, rasm va boshqalar</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {requiredSimpleFields.map(renderField)}
              </div>
              {fileFields.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {fileFields.map(renderField)}
                </div>
              )}
              {booleanFields.length > 0 && (
                <div className="flex flex-wrap gap-6 pt-2 border-t border-border/30">
                  {booleanFields.map(renderField)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {showProgress && uploadStatuses.length > 0 && (
          <div className="card-3d">
            <div className="card-3d-inner glass-card card-shine rounded-2xl p-5 md:p-7">
              <h3 className="font-semibold text-base mb-4">Yuklash jarayoni</h3>
              <UploadProgressBar
                files={uploadStatuses}
                currentStep={uploadStep}
                overallProgress={overallProgress}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isLoading} className="btn-3d px-8 gap-2">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</>
            ) : (
              <><Save className="h-4 w-4" /> Saqlash</>
            )}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.push(redirectPath)} disabled={isLoading} className="gap-2">
            Bekor qilish
          </Button>
        </div>
      </form>

      {/* Multi-language auto-fill dialog */}
      <AlertDialog open={showLangDialog} onOpenChange={setShowLangDialog}>
        <AlertDialogContent className="glass-card rounded-2xl border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <div className="icon-3d rounded-lg p-1.5">
                <Copy className="h-4 w-4 text-primary-foreground" />
              </div>
              Ko'p tilli maydonlarni to'ldirish
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-muted-foreground">
              <p>Quyidagi maydonlar barcha tillarda to'ldirilmagan. Bitta tildagi ma'lumotni qolgan tillarga nusxalashni xohlaysizmi?</p>
              <div className="space-y-2 mt-3">
                {missingFields.map((mf, i) => (
                  <div key={i} className="glass-card rounded-xl p-3 text-sm">
                    <p className="font-medium text-foreground mb-1">{mf.label}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md text-xs font-medium">
                        {LANG_LABELS[mf.filledLang]} ✓
                      </span>
                      <span className="text-muted-foreground">→</span>
                      {mf.emptyLangs.map((l) => (
                        <span key={l} className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md text-xs">
                          {LANG_LABELS[l]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLangDialog(false)} className="gap-2">
              Yo'q, o'zim to'ldiraman
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAutoFill} className="btn-3d gap-2">
              <Copy className="h-4 w-4" /> Ha, nusxalash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
