const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;
const QUALITY = 0.85;
const MAX_FILE_SIZE = 1200 * 1024;

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  originalName: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export { formatSize };

export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size;

  if (file.size < 200 * 1024) {
    return { file, originalSize, compressedSize: originalSize, originalName: file.name };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ file, originalSize, compressedSize: originalSize, originalName: file.name });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = QUALITY;
      let blob: Blob | null = null;

      const tryCompress = () => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              resolve({ file, originalSize, compressedSize: originalSize, originalName: file.name });
              return;
            }

            if (result.size > MAX_FILE_SIZE && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
              return;
            }

            const compressedFile = new File([result], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
              originalName: file.name,
            });
          },
          "image/jpeg",
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      resolve({ file, originalSize, compressedSize: originalSize, originalName: file.name });
    };

    reader.onerror = () => {
      resolve({ file, originalSize, compressedSize: originalSize, originalName: file.name });
    };

    reader.readAsDataURL(file);
  });
}

export async function compressImages(
  files: File[],
  onProgress?: (current: number, total: number, result: CompressResult) => void
): Promise<CompressResult[]> {
  const results: CompressResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i]);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, files.length, result);
    }

    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  return results;
}
