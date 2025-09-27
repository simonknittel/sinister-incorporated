import type { AppList } from "./types";

export const groupByFeatured = (apps: AppList | null) => {
  const featured = apps
    ?.filter((app) => "featured" in app && app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));
  const other = apps
    ?.filter((app) => !("featured" in app) || !app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return {
    featured,
    other,
  };
};
