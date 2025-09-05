import type { Session } from "next-auth";

export const items = (permissions: (boolean | Session)[]) => {
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
