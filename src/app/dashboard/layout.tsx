import { AuthProvider } from "@/components/app/auth";
import { PeopleProvider } from "@/components/app/people";
import { AppStoreProvider } from "@/components/app/store";
import { RecruitmentProvider } from "@/components/dashboard/recruitment-context";
import { InterviewsProvider } from "@/components/dashboard/interviews-context";
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
          <RecruitmentProvider>
            <InterviewsProvider>
              <DashboardShell>{children}</DashboardShell>
            </InterviewsProvider>
          </RecruitmentProvider>
        </AppStoreProvider>
      </PeopleProvider>
    </AuthProvider>
  );
}
