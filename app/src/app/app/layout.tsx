import { AdminEnabler } from "@/auth/components/AdminEnabler";
import { SessionProviderContainer } from "@/auth/components/SessionProviderContainer";
import { authenticatePage } from "@/auth/server";
import ImpersonationBannerContainer from "@/common/components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "@/common/components/QueryClientProviderContainer";
import { DesktopSidebarContainer } from "@/common/components/Sidebar/DesktopSidebarContainer";
import { MobileActionBarContainer } from "@/common/components/Sidebar/MobileActionBarContainer";
import { env } from "@/env";
import { BeamsProvider } from "@/pusher/components/BeamsContext";
import { ChannelsProvider } from "@/pusher/components/ChannelsContext";
import { TRPCReactProvider } from "@/trpc/react";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Readonly<Props>) {
  const [authentication, _cookies] = await Promise.all([
    authenticatePage(),
    cookies(),
  ]);
  const isNavigationCollapsed =
    _cookies.get("navigation_collapsed")?.value === "true";

  return (
    <SessionProviderContainer session={authentication.session}>
      <QueryClientProviderContainer>
        <TRPCReactProvider>
          <ChannelsProvider userId={authentication.session.user.id}>
            <BeamsProvider
              instanceId={env.PUSHER_BEAMS_INSTANCE_ID}
              userId={authentication.session.user.id}
            >
              <NextIntlClientProvider>
                <div
                  className="min-h-dvh background-primary group/navigation"
                  data-navigation-collapsed={
                    isNavigationCollapsed ? "true" : undefined
                  }
                >
                  <MobileActionBarContainer />
                  <DesktopSidebarContainer />

                  <div className="lg:ml-[26rem] group-data-[navigation-collapsed]/navigation:lg:ml-[7rem] min-h-dvh">
                    {children}
                  </div>
                </div>

                <Suspense>
                  <ImpersonationBannerContainer />
                </Suspense>

                {authentication.session.user.role === "admin" && (
                  <AdminEnabler
                    enabled={
                      (await cookies()).get("enable_admin")?.value === "1"
                    }
                  />
                )}
              </NextIntlClientProvider>
            </BeamsProvider>
          </ChannelsProvider>
        </TRPCReactProvider>
      </QueryClientProviderContainer>
    </SessionProviderContainer>
  );
}
