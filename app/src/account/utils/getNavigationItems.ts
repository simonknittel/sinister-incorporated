import { authenticate } from "@/auth/server";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  // const permissions: boolean[] = await Promise.all([]);

  const pages = [];

  pages.push({
    name: "Benachrichtigungen",
    path: "/app/account/notifications",
  });

  return pages;
};
