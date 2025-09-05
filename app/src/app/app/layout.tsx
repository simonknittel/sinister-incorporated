import { AppsContextProvider } from "@/apps/components/AppsContext";
import { getApps } from "@/apps/utils/queries";
import { AdminEnabler } from "@/auth/components/AdminEnabler";
import { SessionProviderContainer } from "@/auth/components/SessionProviderContainer";
import { requireAuthenticationPage } from "@/auth/server";
import { CreateContextProvider } from "@/common/components/CreateContext";
import ImpersonationBannerContainer from "@/common/components/ImpersonationBannerContainer";
import QueryClientProviderContainer from "@/common/components/QueryClientProviderContainer";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { env } from "@/env";
import { BeamsProvider } from "@/pusher/components/BeamsContext";
import { ChannelsProvider } from "@/pusher/components/ChannelsContext";
import { CmdKProvider } from "@/shell/components/CmdK/CmdKContext";
import { DesktopSidebarContainer } from "@/shell/components/Sidebar/DesktopSidebarContainer";
import { MobileActionBarContainer } from "@/shell/components/Sidebar/MobileActionBarContainer";
import { TopBar } from "@/shell/components/TopBar";
import { TRPCReactProvider } from "@/trpc/react";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Readonly<Props>) {
  const [authentication, _cookies, disableAlgolia, apps] = await Promise.all([
    requireAuthenticationPage(),
    cookies(),
    getUnleashFlag("DisableAlgolia"),
    getApps(),
  ]);
  const isNavigationCollapsed =
    _cookies.get("navigation_collapsed")?.value === "true";

  return (
    <SessionProviderContainer session={authentication.session}>
      <NuqsAdapter>
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
                    <AppsContextProvider apps={apps}>
                      <CreateContextProvider>
                        <CmdKProvider disableAlgolia={disableAlgolia}>
                          <MobileActionBarContainer />
                          <DesktopSidebarContainer />
                          <TopBar />
                        </CmdKProvider>

                        <div className="lg:ml-64 group-data-[navigation-collapsed]/navigation:lg:ml-[4.5rem] lg:pt-16 min-h-dvh">
                          {children}
                        </div>
                      </CreateContextProvider>
                    </AppsContextProvider>
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
      </NuqsAdapter>
    </SessionProviderContainer>
  );
}
