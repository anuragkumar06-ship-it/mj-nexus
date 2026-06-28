"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { useAuth } from "@/components/app/auth";
import { HrCertificates } from "@/components/dashboard/certificates/hr-certificates";
import { MyCertificates } from "@/components/dashboard/certificates/my-certificates";

export default function CertificatesPage() {
  const { role } = useAuth();
  const isHr = role === "hr" || role === "management";
  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title={isHr ? "Certificate Automation" : "My Certificates"}
        description={
          isHr
            ? "Auto-generate completion and appreciation certificates plus personalized recommendation letters."
            : "Your earned certificates — download and share them anytime."
        }
      />
      {isHr ? <HrCertificates /> : <MyCertificates />}
    </>
  );
}
