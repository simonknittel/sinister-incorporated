import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";
import { authenticatePage } from "../../lib/auth/server";
import { TRPCReactProvider } from "../../trpc/react";
import { AdminEnabler } from "../_components/AdminEnabler";
import ImpersonationBannerContainer from "../_components/ImpersonationBannerContainer";
import { PreviewComments } from "../_components/PreviewComments";
import QueryClientProviderContainer from "../_components/QueryClientProviderContainer";
import SessionProviderContainer from "../_components/SessionProviderContainer";
import { Sidebar } from "../_components/Sidebar/Sidebar";
import SidebarContainer from "../_components/Sidebar/SidebarContainer";
import { SidebarSkeleton } from "../_components/Sidebar/SidebarSkeleton";

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
            <SidebarContainer>
              <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar />
              </Suspense>
            </SidebarContainer>

            <div className="lg:ml-[26rem] min-h-dvh">{children}</div>
          </div>

          <Suspense>
            <ImpersonationBannerContainer />
          </Suspense>

          {authentication.session.user.role === "admin" && (
            <AdminEnabler
              enabled={cookies().get("enableAdmin")?.value === "enableAdmin"}
            />
          )}

          <Suspense>
            <PreviewComments />
          </Suspense>
        </TRPCReactProvider>
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
