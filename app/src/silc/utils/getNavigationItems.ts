import { authenticate } from "@/auth/server";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("silcTransactionOfOtherCitizen", "read"),
    authentication.authorize("silcSetting", "manage"),
  ]);

  const pages = [];

  if (permissions[0]) {
    pages.push({
      name: "Übersicht",
      path: "/app/silc",
    });
  }

  if (permissions[1]) {
    pages.push({
      name: "Transaktionen",
      path: "/app/silc/transactions",
    });
  }

  if (permissions[2]) {
    pages.push({
      name: "Einstellungen",
      path: "/app/silc/settings",
    });
  }

  return pages;
};
