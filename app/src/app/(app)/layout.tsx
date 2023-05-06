import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { authOptions } from "~/server/auth";
import SessionProviderContainer from "./_components/SessionProviderContainer";
import Sidebar from "./_components/Sidebar";
import SidebarContainer from "./_components/SidebarContainer";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  if (session.user.role === "new") redirect("/onboarding");

  return (
    <SessionProviderContainer session={session}>
      <div className="min-h-screen">
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>

        <div className="lg:ml-96 min-h-screen p-4 lg:p-8 pt-20">{children}</div>
      </div>
    </SessionProviderContainer>
  );
}
