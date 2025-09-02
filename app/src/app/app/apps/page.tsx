import { App } from "@/apps/components/App";
import { AppGrid } from "@/apps/components/AppGrid";
import { RedactedApp } from "@/apps/components/RedactedApp";
import { getApps } from "@/apps/utils/getApps";
import { requireAuthenticationPage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Apps | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/apps");

  const { featuredApps, otherApps } = await getApps();

  return (
    <main className="p-4 pb-20 lg:pb-4 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Apps" withGlitch size="md" />
      </div>

      <h2 className="font-bold mt-8">Featured</h2>

      <AppGrid className="mt-2">
        {featuredApps.map((app) =>
          app.redacted ? (
            <RedactedApp key={app.name} />
          ) : (
            <App
              key={app.name}
              name={app.name}
              href={app.href}
              imageSrc={app.imageSrc}
              description={app.description}
            />
          ),
        )}
      </AppGrid>

      <h2 className="font-bold mt-8">Weitere</h2>

      <AppGrid className="mt-2">
        {otherApps.map((app) =>
          app.redacted ? (
            <RedactedApp key={app.name} />
          ) : (
            <App
              key={app.name}
              name={app.name}
              href={app.href}
              imageSrc={app.imageSrc}
              description={app.description}
            />
          ),
        )}
      </AppGrid>
    </main>
  );
}
