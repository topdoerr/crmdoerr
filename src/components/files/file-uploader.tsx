"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/app/(dashboard)/files/actions";

interface FileUploaderProps {
  relType: string;
  relId: number;
  onUploaded?: () => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function FileUploader({ relType, relId, onUploaded }: FileUploaderProps) {
  const router = useRouter();
  const [pending, setPending] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    setPending((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  function removePending(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (pending.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of pending) {
        const fd = new FormData();
        fd.append("file", file);
        await uploadFile(fd, relType, relId);
      }
      setPending([]);
      onUploaded?.();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`cursor-pointer border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? "border-primary bg-muted/50" : "border-muted"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files, or click to select"}
        </p>
      </Card>

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePending(i)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : `Upload ${pending.length} file(s)`}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
