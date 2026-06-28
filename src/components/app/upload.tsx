"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Attachment } from "@/components/app/store";
import { uploadFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export function FileDropzone({
  files,
  onChange,
  accept = "image/*,application/pdf",
  max = 6,
  hint = "PNG, JPG or PDF - screenshots of your work",
}: {
  files: Attachment[];
  onChange: (files: Attachment[]) => void;
  accept?: string;
  max?: number;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  const add = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setBusy(true);
    try {
      const uploaded = await Promise.all(Array.from(list).map((f) => uploadFile(f)));
      onChange([...files, ...uploaded].slice(0, max));
    } finally {
      setBusy(false);
    }
  };

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          drag
            ? "border-mjblue bg-mjblue-50"
            : "border-navy/15 bg-offwhite/60 hover:border-mjblue/40 hover:bg-mjblue-50/40"
        )}
      >
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
        </div>
        <p className="text-sm font-semibold text-navy">
          {busy ? "Uploading…" : <>Drop files or <span className="text-mjblue">browse</span></>}
        </p>
        <p className="text-xs text-slate-400">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => add(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {files.map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-navy/8 bg-white"
            >
              {f.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} className="h-20 w-full object-cover" />
              ) : (
                <div className="grid h-20 w-full place-items-center bg-navy/[0.03] text-mjblue">
                  {f.type.includes("pdf") ? (
                    <FileText className="h-7 w-7" />
                  ) : (
                    <ImageIcon className="h-7 w-7" />
                  )}
                </div>
              )}
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <p className="truncate text-[11px] font-medium text-navy">{f.name}</p>
                <span className="shrink-0 text-[10px] text-slate-400">{fmtBytes(f.size)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(i);
                }}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-lg bg-navy/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact read-only attachment chips (for reviewers). */
export function AttachmentChips({ files }: { files: Attachment[] }) {
  if (!files?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((f, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/8 bg-white px-2.5 py-1.5 text-xs font-medium text-navy/70"
        >
          {f.type?.includes("pdf") ? (
            <FileText className="h-3.5 w-3.5 text-mjblue" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5 text-mjblue" />
          )}
          {f.name}
        </span>
      ))}
    </div>
  );
}
