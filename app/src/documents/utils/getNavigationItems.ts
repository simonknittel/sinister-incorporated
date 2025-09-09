import { authenticate } from "@/auth/server";
import type { Page } from "@/common/components/layouts/DefaultLayout/Navigation";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  // const permissions: boolean[] = await Promise.all([]);

  const pages: Page[] = [];

  pages.push({
    title: "Alle Dokumente",
    url: "/app/documents",
  });

  return pages;
};
