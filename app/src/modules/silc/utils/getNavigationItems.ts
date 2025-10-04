import { authenticate } from "@/modules/auth/server";
import type { Page } from "@/modules/common/components/layouts/DefaultLayout/Navigation";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("silcTransactionOfOtherCitizen", "read"),
    authentication.authorize("silcSetting", "manage"),
    authentication.authorize("profitDistributionCycle", "read"),
    authentication.authorize("profitDistributionCycle", "manage"),
  ]);

  const EnableProfitDistribution = await getUnleashFlag(
    UNLEASH_FLAG.EnableProfitDistribution,
  );

  const pages: Page[] = [];

  if (permissions[0]) {
    pages.push({
      title: "Dashboard",
      url: "/app/silc/dashboard",
    });
  }

  if (EnableProfitDistribution && (permissions[3] || permissions[4])) {
    pages.push({
      title: "Gewinnverteilung",
      url: "/app/silc/profit-distribution",
    });
  }

  if (permissions[1]) {
    pages.push({
      title: "Transaktionen",
      url: "/app/silc/transactions",
    });
  }

  if (permissions[2]) {
    pages.push({
      title: "Einstellungen",
      url: "/app/silc/settings",
    });
  }

  return pages;
};
