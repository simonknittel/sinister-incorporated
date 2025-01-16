import { AdminEnabler } from "@/auth/components/AdminEnabler";
import { SessionProviderContainer } from "@/auth/components/SessionProviderContainer";
import { authenticatePage } from "@/auth/server";
import ImpersonationBannerContainer from "@/common/components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "@/common/components/QueryClientProviderContainer";
import { DesktopSidebarContainer } from "@/common/components/Sidebar/DesktopSidebarContainer";
import { MobileActionBarContainer } from "@/common/components/Sidebar/MobileActionBarContainer";
import { PusherBeams } from "@/pusher/components/PusherBeams";
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
              enabled={(await cookies()).get("enable_admin")?.value === "1"}
            />
          )}

          <Suspense>
            <PusherBeams />
          </Suspense>
        </TRPCReactProvider>
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
