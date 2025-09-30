import { AppTile } from "@/modules/apps/components/AppTile";
import { AppTileGrid } from "@/modules/apps/components/AppTileGrid";
import { Filters } from "@/modules/apps/components/Filters";
import { RedactedAppTile } from "@/modules/apps/components/RedactedAppTile";
import { groupByFeatured } from "@/modules/apps/utils/groupByFeatured";
import { getAppLinks } from "@/modules/apps/utils/queries";
import type { App } from "@/modules/apps/utils/types";
import { requireAuthenticationPage } from "@/modules/auth/server";
import { type Metadata } from "next";
import { createLoader, parseAsArrayOf, parseAsString } from "nuqs/server";

const loadSearchParams = createLoader({
  tag: parseAsArrayOf(parseAsString).withDefault(["all"]),
});

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Apps | S.A.M. - Sinister Incorporated",
};

export default async function Page({ searchParams }: PageProps<"/app/apps">) {
  await requireAuthenticationPage("/app/apps");

  const apps = await getAppLinks();

  const { tag: selectedTags } = await loadSearchParams(searchParams);
  const { featured, other } = groupByFeatured(apps);

  const filteredApps = apps?.filter((app) => {
    if (selectedTags.includes("all")) return true;

    if ("tags" in app && app.tags)
      return app.tags.some((tag) => selectedTags.includes(tag));

    return false;
  });

  return (
    <>
      <Filters appLinks={apps} selectedTags={selectedTags} className="mb-4" />

      {selectedTags.includes("all") ? (
        <>
          <AppTileGrid>
            {featured?.map((app) =>
              "redacted" in app && app.redacted ? (
                <RedactedAppTile key={app.name} />
              ) : (
                <AppTile key={app.name} app={app as App} />
              ),
            )}
          </AppTileGrid>

          <AppTileGrid className="mt-8">
            {other?.map((app) =>
              "redacted" in app && app.redacted ? (
                <RedactedAppTile key={app.name} />
              ) : (
                <AppTile key={app.name} app={app as App} />
              ),
            )}
          </AppTileGrid>
        </>
      ) : (
        <AppTileGrid>
          {filteredApps
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((app) =>
              "redacted" in app && app.redacted ? (
                <RedactedAppTile key={app.name} />
              ) : (
                <AppTile key={app.name} app={app as App} />
              ),
            )}
        </AppTileGrid>
      )}
    </>
  );
}
