import { AuthProvider } from "@/components/app/auth";
import { PeopleProvider } from "@/components/app/people";
import { AppStoreProvider } from "@/components/app/store";
import { DashboardShell } from "@/components/dashboard/shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PeopleProvider>
        <AppStoreProvider>
          <DashboardShell>{children}</DashboardShell>
        </AppStoreProvider>
      </PeopleProvider>
    </AuthProvider>
  );
}
