import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { authenticatePage } from "../_lib/auth/authenticateAndAuthorize";
import ImpersonationBannerContainer from "./_components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "./_components/QueryClientProviderContainer";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import Sidebar from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";
import SidebarSkeleton from "./_components/SidebarSkeleton";

interface Props {
  children: ReactNode;
  fleetModal: ReactNode;
}

export default async function AppLayout({ children, fleetModal }: Props) {
  const authentication = await authenticatePage();
  if (
    authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ]) === false
  )
    redirect("/onboarding");

  return (
    <SessionProviderContainer session={authentication.session}>
      <QueryClientProviderContainer>
        <div className="h-full">
          <SidebarContainer>
            <Suspense fallback={<SidebarSkeleton />}>
              <Sidebar />
            </Suspense>
          </SidebarContainer>

          <div className="lg:ml-96 h-full">{children}</div>
        </div>

        {fleetModal}

        <Suspense>
          <ImpersonationBannerContainer />
        </Suspense>
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
