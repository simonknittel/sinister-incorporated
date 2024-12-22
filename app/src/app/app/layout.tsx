import { authenticatePage } from "@/auth/server";
import { AdminEnabler } from "@/common/components/AdminEnabler";
import ImpersonationBannerContainer from "@/common/components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "@/common/components/QueryClientProviderContainer";
import SessionProviderContainer from "@/common/components/SessionProviderContainer";
import { DesktopSidebarContainer } from "@/common/components/Sidebar/DesktopSidebarContainer";
import { MobileActionBarContainer } from "@/common/components/Sidebar/MobileActionBarContainer";
import { TRPCReactProvider } from "@/trpc/react";
import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Readonly<Props>) {
  const authentication = await authenticatePage();

  return (
    <SessionProviderContainer session={authentication.session}>
      <QueryClientProviderContainer>
        <TRPCReactProvider>
          <div className="min-h-dvh bg-sinister-radial-gradient">
            <MobileActionBarContainer />
            <DesktopSidebarContainer />

            <div className="lg:ml-[26rem] min-h-dvh">{children}</div>
          </div>

          <Suspense>
            <ImpersonationBannerContainer />
          </Suspense>

          {authentication.session.user.role === "admin" && (
            <AdminEnabler
              enabled={cookies().get("enable_admin")?.value === "1"}
            />
          )}
        </TRPCReactProvider>
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
