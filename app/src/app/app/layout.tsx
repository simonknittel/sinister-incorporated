import { authenticatePage } from "@/auth/server";
import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";
import { TRPCReactProvider } from "../../trpc/react";
import { AdminEnabler } from "../_components/AdminEnabler";
import ImpersonationBannerContainer from "../_components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "../_components/QueryClientProviderContainer";
import SessionProviderContainer from "../_components/SessionProviderContainer";
import { DesktopSidebarContainer } from "../_components/Sidebar/DesktopSidebarContainer";
import { MobileActionBarContainer } from "../_components/Sidebar/MobileActionBarContainer";

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
