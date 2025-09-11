import { AppTile } from "@/modules/apps/components/AppTile";
import { AppTileGrid } from "@/modules/apps/components/AppTileGrid";
import { RedactedAppTile } from "@/modules/apps/components/RedactedAppTile";
import { groupByFeatured } from "@/modules/apps/utils/groupByFeatured";
import { getAppLinks } from "@/modules/apps/utils/queries";
import type { App } from "@/modules/apps/utils/types";
import { requireAuthenticationPage } from "@/modules/auth/server";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Apps | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/apps");

  const apps = await getAppLinks();
  const { featured, other } = groupByFeatured(apps);

  return (
    <>
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
    </>
  );
}
