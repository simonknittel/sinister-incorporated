import { authenticate } from "@/auth/server";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  // const permissions = await Promise.all();

  const pages = [];

  pages.push({
    name: "Übersicht",
    path: "/app/events",
  });

  return pages;
};
