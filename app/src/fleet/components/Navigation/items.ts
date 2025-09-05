import type { Session } from "next-auth";

export const items = (permissions: (boolean | Session)[]) => {
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
