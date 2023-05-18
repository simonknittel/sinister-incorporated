import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { prisma } from "~/server/db";
import {
  authenticateAndAuthorize,
  authenticateAndAuthorizePage,
} from "../_utils/authenticateAndAuthorize";
import ImpersonationBannerContainer from "./_components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "./_components/QueryClientProviderContainer";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import Sidebar from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";
import SidebarSkeleton from "./_components/SidebarSkeleton";

async function getImpersonatedRole() {
  const cookieStore = cookies();
  const impersonate = cookieStore.get("impersonate");

  if (!impersonate) return null;

  return await prisma.role.findUnique({
    where: { id: impersonate.value },
  });
}

interface Props {
  children: ReactNode;
  fleetModal: ReactNode;
}

export default async function AppLayout({ children, fleetModal }: Props) {
  const session = await authenticateAndAuthorizePage();
  if ((await authenticateAndAuthorize("login")) === false)
    redirect("/onboarding");

  return (
    <SessionProviderContainer session={session}>
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
