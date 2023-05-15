import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { authOptions } from "~/server/auth";
import QueryClientProviderContainer from "./_components/QueryClientProviderContainer";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import Sidebar from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";

interface Props {
  children: ReactNode;
  fleetModal: ReactNode;
}

export default async function AppLayout({ children, fleetModal }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  if (["confirmed", "admin"].includes(session.user.role || "") === false)
    redirect("/onboarding");

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
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
