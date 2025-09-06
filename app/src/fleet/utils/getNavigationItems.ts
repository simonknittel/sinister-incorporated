import { authenticate } from "@/auth/server";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("orgFleet", "read"),
    authentication.authorize("ship", "manage"),
    authentication.authorize("manufacturersSeriesAndVariants", "manage"),
  ]);

  const pages = [];

  if (permissions[0]) {
    pages.push({
      name: "Sinister Incorporated",
      path: "/app/fleet/org",
    });
  }

  if (permissions[1]) {
    pages.push({
      name: "Meine Schiffe",
      path: "/app/fleet/my-ships",
    });
  }

  if (permissions[2]) {
    pages.push({
      name: "Einstellungen",
      path: "/app/fleet/settings/manufacturer",
    });
  }

  return pages;
};
