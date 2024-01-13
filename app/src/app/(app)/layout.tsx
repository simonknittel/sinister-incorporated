import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { authenticatePage } from "../../_lib/auth/authenticateAndAuthorize";
import AdminDisabler from "./_components/AdminDisabler";
import ImpersonationBannerContainer from "./_components/ImpersonationBannerContainer";
import PreviewComments from "./_components/PreviewComments";
import QueryClientProviderContainer from "./_components/QueryClientProviderContainer";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import Sidebar from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";
import SidebarSkeleton from "./_components/SidebarSkeleton";

interface Props {
  children: ReactNode;
  fleetModal: ReactNode;
}

export default async function AppLayout({
  children,
  fleetModal,
}: Readonly<Props>) {
  const authentication = await authenticatePage();

  // await validateConfirmedEmailForPage(authentication.session);

  if (
    authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ]) === false ||
    authentication.authorize([
      {
        resource: "login",
        operation: "negate",
      },
    ]) === true
  )
    redirect("/clearance");

  return (
    <SessionProviderContainer session={authentication.session}>
      <QueryClientProviderContainer>
        <TRPCReactProvider headers={headers()}>
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

          {authentication.session.user.role === "admin" && (
            <AdminDisabler
              disabled={cookies().get("disableAdmin")?.value === "disableAdmin"}
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
