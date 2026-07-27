"use client";

import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";

export interface UploadFileStatus {
  name: string;
  originalSize: string;
  compressedSize: string;
  status: "pending" | "compressing" | "compressed" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

interface UploadProgressBarProps {
  files: UploadFileStatus[];
  currentStep: "compressing" | "uploading" | "done";
  overallProgress: number;
  className?: string;
}

export function UploadProgressBar({ files, currentStep, overallProgress, className }: UploadProgressBarProps) {
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {currentStep === "compressing" && "Rasmlar siqilmoqda..."}
            {currentStep === "uploading" && "Rasmlar yuklanmoqda..."}
            {currentStep === "done" && "Tayyor!"}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {currentStep === "done"
              ? `${doneCount}/${files.length}`
              : `${doneCount + (currentStep === "uploading" ? Math.floor((files.length - doneCount - errorCount) * overallProgress / 100) : 0)}/${files.length}`}
            {" "}({Math.round(overallProgress)}%)
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              errorCount > 0 && currentStep === "done" ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1.5">
        {files.map((file, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
              file.status === "error" && "bg-destructive/5",
              file.status === "done" && "bg-emerald-50 dark:bg-emerald-950/20",
              file.status === "compressing" && "bg-blue-50 dark:bg-blue-950/20",
              file.status === "uploading" && "bg-primary/5"
            )}
          >
            <span className="shrink-0">
              {file.status === "compressing" || file.status === "uploading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : file.status === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : file.status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </span>
            <span className="truncate flex-1 font-medium">{file.name}</span>
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {file.originalSize}
              {file.compressedSize !== file.originalSize && (
                <span className="text-emerald-500 ml-1">→ {file.compressedSize}</span>
              )}
            </span>
            {file.status === "uploading" && (
              <span className="text-primary shrink-0 tabular-nums w-9 text-right">
                {Math.round(file.progress)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
