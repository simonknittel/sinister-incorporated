import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { requireConfirmedEmailForPage } from "~/_lib/emailConfirmation";
import { TRPCReactProvider } from "~/trpc/react";
import { authenticatePage } from "../../_lib/auth/authenticateAndAuthorize";
import { AdminEnabler } from "./_components/AdminEnabler";
import ImpersonationBannerContainer from "./_components/ImpersonationBannerContainer";
import PreviewComments from "./_components/PreviewComments";
import QueryClientProviderContainer from "./_components/QueryClientProviderContainer";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import { Sidebar } from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";
import SidebarSkeleton from "./_components/SidebarSkeleton";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Readonly<Props>) {
  const authentication = await authenticatePage();

  await requireConfirmedEmailForPage(authentication.session);

  if (
    !authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ])
  )
    redirect("/clearance");

  return (
    <SessionProviderContainer session={authentication.session}>
      <QueryClientProviderContainer>
        <TRPCReactProvider headers={headers()}>
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
