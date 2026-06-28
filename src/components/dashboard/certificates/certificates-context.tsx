"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CERTIFICATE_SEED, type Certificate, type CertStatus } from "@/lib/certificates";
import { isSupabaseConfigured } from "@/lib/config";

interface CertificatesCtx {
  certificates: Certificate[];
  addCertificate: (c: Certificate) => void;
  setStatus: (id: string, status: CertStatus, issuedBy?: string, issuedByName?: string) => void;
  removeCertificate: (id: string) => void;
  live: boolean;
}

const Ctx = createContext<CertificatesCtx | null>(null);

export function CertificatesProvider({ children }: { children: ReactNode }) {
  const live = isSupabaseConfigured();
  const [certificates, setCertificates] = useState<Certificate[]>(live ? [] : CERTIFICATE_SEED);

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/certificates-data");
        setCertificates(await m.loadCertificates());
        unsub = m.subscribeCertificates((type, obj) =>
          setCertificates((prev) => {
            if (type === "DELETE") return prev.filter((c) => c.id !== (obj as { id: string }).id);
            const o = obj as Certificate;
            const i = prev.findIndex((c) => c.id === o.id);
            if (i >= 0) {
              const copy = [...prev];
              copy[i] = o;
              return copy;
            }
            return [o, ...prev];
          })
        );
      } catch {
        // DB unavailable - stay clean
      }
    })();
    return () => unsub();
  }, [live]);

  const notifyIssued = (recipientId: string, type: string) => {
    if (live && recipientId) import("@/lib/supabase/notifications-data").then((m) => m.notify(recipientId, `You received a ${type} certificate 🎓`, { type: "certificate", href: "/dashboard/certificates" })).catch(() => {});
  };

  const addCertificate = (c: Certificate) => {
    setCertificates((prev) => [c, ...prev]);
    if (live) import("@/lib/supabase/certificates-data").then((m) => m.insertCertificate(c)).catch(() => {});
    if (c.status === "Issued") notifyIssued(c.recipientId, c.type);
  };
  const setStatus = (id: string, status: CertStatus, issuedBy?: string, issuedByName?: string) => {
    setCertificates((prev) => prev.map((c) => (c.id === id ? { ...c, status, issuedBy: issuedBy ?? c.issuedBy, issuedByName: issuedByName ?? c.issuedByName } : c)));
    if (live) import("@/lib/supabase/certificates-data").then((m) => m.updateCertificateStatus(id, status, issuedBy, issuedByName)).catch(() => {});
    if (status === "Issued") {
      const cert = certificates.find((c) => c.id === id);
      if (cert) notifyIssued(cert.recipientId, cert.type);
    }
  };
  const removeCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    if (live) import("@/lib/supabase/certificates-data").then((m) => m.deleteCertificate(id)).catch(() => {});
  };

  return <Ctx.Provider value={{ certificates, addCertificate, setStatus, removeCertificate, live }}>{children}</Ctx.Provider>;
}

export function useCertificates() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCertificates must be used within CertificatesProvider");
  return c;
}
