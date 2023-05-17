import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import { authorize } from "../_utils/authorize";
import ImpersonationBanner from "./_components/ImpersonationBanner";
import QueryClientProviderContainer from "./_components/QueryClientProviderContainer";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import Sidebar from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";

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
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  if (!authorize("login", session)) redirect("/onboarding");

  const impersonatedRole = await getImpersonatedRole();

  return (
    <SessionProviderContainer session={session}>
      <QueryClientProviderContainer>
        <div className="h-full">
          <SidebarContainer>
            <Sidebar />
          </SidebarContainer>

          <div className="lg:ml-96 h-full">{children}</div>
        </div>

        {fleetModal}

        {impersonatedRole && <ImpersonationBanner role={impersonatedRole} />}
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
