import { AppTile } from "@/apps/components/AppTile";
import { AppTileGrid } from "@/apps/components/AppTileGrid";
import { RedactedAppTile } from "@/apps/components/RedactedAppTile";
import { getApps } from "@/apps/utils/queries";
import type { App } from "@/apps/utils/types";
import { requireAuthenticationPage } from "@/auth/server";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Apps | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/apps");

  const apps = await getApps();
  const featured = apps
    ?.filter((app) => "featured" in app && app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));
  const other = apps
    ?.filter((app) => !("featured" in app) || !app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-[1920px] mx-auto">
      <h2 className="font-bold">Featured</h2>

      <AppTileGrid className="mt-2">
        {featured?.map((app) =>
          "redacted" in app && app.redacted ? (
            <RedactedAppTile key={app.name} />
          ) : (
            <AppTile key={app.name} app={app as App} />
          ),
        )}
      </AppTileGrid>

      <h2 className="font-bold mt-8">Weitere</h2>

      <AppTileGrid className="mt-2">
        {other?.map((app) =>
          "redacted" in app && app.redacted ? (
            <RedactedAppTile key={app.name} />
          ) : (
            <AppTile key={app.name} app={app as App} />
          ),
        )}
      </AppTileGrid>
    </div>
  );
}
