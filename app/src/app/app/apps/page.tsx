import { AppTile } from "@/apps/components/AppTile";
import { AppTileGrid } from "@/apps/components/AppTileGrid";
import { RedactedAppTile } from "@/apps/components/RedactedAppTile";
import { getApps } from "@/apps/utils/queries";
import { requireAuthenticationPage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Apps | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/apps");

  const apps = await getApps();
  const featured = apps
    ?.filter((app) => app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));
  const other = apps
    ?.filter((app) => !app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="p-4 pb-20 lg:pb-4 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Apps" withGlitch size="md" />
      </div>

      <h2 className="font-bold mt-8">Featured</h2>

      <AppTileGrid className="mt-2">
        {featured?.map((app) =>
          app.redacted ? (
            <RedactedAppTile key={app.name} />
          ) : (
            <AppTile
              key={app.name}
              name={app.name}
              href={app.href}
              imageSrc={app.imageSrc}
              description={app.description}
            />
          ),
        )}
      </AppTileGrid>

      <h2 className="font-bold mt-8">Weitere</h2>

      <AppTileGrid className="mt-2">
        {other?.map((app) =>
          app.redacted ? (
            <RedactedAppTile key={app.name} />
          ) : (
            <AppTile
              key={app.name}
              name={app.name}
              href={app.href}
              imageSrc={app.imageSrc}
              description={app.description}
            />
          ),
        )}
      </AppTileGrid>
    </main>
  );
}
