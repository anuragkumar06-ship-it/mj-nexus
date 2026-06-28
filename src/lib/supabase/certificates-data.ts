"use client";

import { createClient } from "./client";
import type { Certificate, CertStatus } from "@/lib/certificates";

function fromRow(r: any): Certificate {
  return {
    id: r.id,
    recipientId: r.recipient_id ?? "",
    recipientName: r.recipient_name ?? "",
    type: r.type ?? "Completion",
    title: r.title ?? "",
    message: r.message ?? "",
    issuedBy: r.issued_by ?? "",
    issuedByName: r.issued_by_name ?? "",
    status: r.status ?? "Issued",
    createdAt: (r.created_at ?? "").slice(0, 10),
    fileUrl: r.file_url ?? undefined,
    fileName: r.file_name ?? undefined,
  };
}
function toRow(c: Certificate): any {
  return {
    id: c.id,
    recipient_id: c.recipientId,
    recipient_name: c.recipientName,
    type: c.type,
    title: c.title,
    message: c.message,
    issued_by: c.issuedBy,
    issued_by_name: c.issuedByName,
    status: c.status,
    file_url: c.fileUrl ?? null,
    file_name: c.fileName ?? null,
  };
}

export async function loadCertificates(): Promise<Certificate[]> {
  const { data, error } = await createClient().from("certificates").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}
export async function insertCertificate(c: Certificate) {
  const { error } = await createClient().from("certificates").insert(toRow(c));
  if (error) throw error;
}
export async function updateCertificateStatus(id: string, status: CertStatus, issuedBy?: string, issuedByName?: string) {
  const patch: any = { status };
  if (issuedBy) patch.issued_by = issuedBy;
  if (issuedByName) patch.issued_by_name = issuedByName;
  const { error } = await createClient().from("certificates").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteCertificate(id: string) {
  const { error } = await createClient().from("certificates").delete().eq("id", id);
  if (error) throw error;
}
export function subscribeCertificates(onChange: (type: string, obj: Certificate | { id: string }) => void) {
  const s = createClient();
  const ch = s
    .channel("mj-certificates-realtime")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "certificates" }, (p: any) =>
      onChange(p.eventType, p.eventType === "DELETE" ? { id: p.old?.id } : fromRow(p.new))
    )
    .subscribe();
  return () => s.removeChannel(ch);
}
