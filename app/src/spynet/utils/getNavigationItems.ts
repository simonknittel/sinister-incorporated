import { authenticate } from "@/auth/server";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("citizen", "read"),
    authentication.authorize("organization", "read"),
    authentication.authorize("citizen", "create"),
    authentication.authorize("organization", "create"),
    authentication.authorize("spynetActivity", "read"),
    authentication.authorize("spynetCitizen", "read"),
    authentication.authorize("spynetNotes", "read"),
    authentication.authorize("spynetOther", "read"),
    authentication.authorize("noteType", "manage"),
    authentication.authorize("classificationLevel", "manage"),
  ]);

  const pages = [];

  if (permissions[0] || permissions[1]) {
    pages.push({
      name: "Suche",
      path: "/app/spynet",
    });
  }

  if (permissions[4]) {
    pages.push({
      name: "Aktivität",
      path: "/app/spynet/activity",
    });
  }

  if (permissions[0] && permissions[5]) {
    pages.push({
      name: "Citizen",
      path: "/app/spynet/citizen",
    });
  }

  if (permissions[0] && permissions[6]) {
    pages.push({
      name: "Notizen",
      path: "/app/spynet/notes",
    });
  }

  if (permissions[0] && permissions[7]) {
    pages.push({
      name: "Sonstige",
      path: "/app/spynet/other",
    });
  }

  if (permissions[8] || permissions[9]) {
    pages.push({
      name: "Einstellungen",
      path: "/app/spynet/settings",
    });
  }

  return pages;
};
