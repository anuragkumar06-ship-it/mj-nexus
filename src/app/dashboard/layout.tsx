import { AuthProvider } from "@/components/app/auth";
import { AppStoreProvider } from "@/components/app/store";
import { DashboardShell } from "@/components/dashboard/shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <DashboardShell>{children}</DashboardShell>
      </AppStoreProvider>
    </AuthProvider>
  );
}
