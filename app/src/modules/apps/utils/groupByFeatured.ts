import type { AppList } from "./types";

export const groupByFeatured = (apps: AppList | null) => {
  const featured = apps
    ?.filter((app) => "tags" in app && app.tags?.includes("featured"))
    .toSorted((a, b) => a.name.localeCompare(b.name));
  const other = apps
    ?.filter((app) => !("tags" in app && app.tags?.includes("featured")))
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return {
    featured,
    other,
  };
};
