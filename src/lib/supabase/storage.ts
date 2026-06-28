"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import type { Attachment } from "@/components/app/store";

/**
 * Uploads a real file to the Supabase `submissions` storage bucket and returns
 * an Attachment with the public URL. Falls back to a local object URL in demo mode.
 */
export async function uploadFile(file: File): Promise<Attachment> {
  const base: Attachment = {
    name: file.name,
    size: file.size,
    type: file.type,
    url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
  };
  if (!isSupabaseConfigured()) return base;

  try {
    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("submissions").upload(path, file, { upsert: false });
    if (error) return base;
    const { data } = supabase.storage.from("submissions").getPublicUrl(path);
    return { ...base, url: data.publicUrl };
  } catch {
    return base;
  }
}
