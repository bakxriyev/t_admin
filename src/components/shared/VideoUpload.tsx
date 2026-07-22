"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Video as VideoIcon } from "lucide-react";

interface VideoUploadProps {
  value?: string | File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function VideoUpload({ value, onChange, className }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [isRemoved, setIsRemoved] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (typeof value === "string" && value) {
      setPreview(value);
      setIsRemoved(false);
    }
  }, [value]);

  const handleFile = useCallback(
    (file: File | null) => {
      if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        onChange(file);
        setIsRemoved(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setIsRemoved(true);
    onChange(null);
  };

  const previewUrl =
    !isRemoved && (preview || (typeof value === "string" ? value : null));

  return (
    <div className={cn("space-y-2", className)}>
      {previewUrl ? (
        <div className="relative inline-block w-full">
          <video
            src={previewUrl}
            controls
            className="h-48 w-full object-cover rounded-lg border bg-black"
          >
            <source src={previewUrl} />
          </video>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onClick={() => inputRef.current?.click()}
        >
          <VideoIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Videoni tashlang yoki tanlang
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            MP4, WebM, OGG (max 50MB)
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInput}
      />
    </div>
  );
}
