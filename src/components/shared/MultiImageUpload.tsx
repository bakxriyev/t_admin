"use client";

import { useState, useCallback, useId, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Upload, Plus } from "lucide-react";

interface MultiImageUploadProps {
  value?: (string | File)[] | null;
  onChange: (files: File[]) => void;
  className?: string;
}

export function MultiImageUpload({ value, onChange, className }: MultiImageUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; isExisting: boolean }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const existingUrls: { url: string; isExisting: boolean }[] = [];
      value.forEach((item) => {
        if (typeof item === "string" && item) {
          existingUrls.push({ url: item, isExisting: true });
        }
      });
      setPreviews((prev) => {
        const existingOnly = existingUrls.filter((e) => !newFiles.length || e.isExisting);
        return [...existingOnly, ...previews.filter((p) => !p.isExisting)];
      });
    }
  }, [value]);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, { url: e.target?.result as string, isExisting: false }]);
        };
        reader.readAsDataURL(file);
      });

      const combined = [...newFiles, ...imageFiles];
      setNewFiles(combined);
      onChange(combined);
    },
    [newFiles, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleRemoveNew = (index: number) => {
    setPreviews((prev) => {
      const nonExisting = prev.filter(p => !p.isExisting);
      if (index < nonExisting.length) {
        const toRemove = nonExisting[index];
        return prev.filter(p => p.url !== toRemove.url);
      }
      return prev;
    });
    const updated = newFiles.filter((_, i) => i !== index);
    setNewFiles(updated);
    onChange(updated);
  };

  const handleRemoveExisting = (url: string) => {
    setPreviews((prev) => prev.filter((p) => p.url !== url));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((preview, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                <img
                  src={preview.url}
                  alt={`Rasm ${idx + 1}`}
                  className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1.5 right-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => {
                    if (preview.isExisting) {
                      handleRemoveExisting(preview.url);
                    } else {
                      const nIdx = previews.filter((p) => !p.isExisting).indexOf(preview);
                      if (nIdx >= 0) handleRemoveNew(nIdx);
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                {preview.isExisting && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-muted-foreground">
                    Mavjud
                  </span>
                )}
              </div>
            ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer p-6",
          isDragOver
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
        )}
        onClick={() => inputRef.current?.click()}
      >
        {previews.length > 0 ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Plus className="h-6 w-6" />
            <p className="text-sm">Yana rasm qo'shish</p>
            <p className="text-xs">{previews.length} ta rasm tanlangan</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              Rasmlarni tashlang yoki tanlang
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WebP - avtomatik optimallashtiriladi (max 2048px)
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInput}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />
    </div>
  );
}
