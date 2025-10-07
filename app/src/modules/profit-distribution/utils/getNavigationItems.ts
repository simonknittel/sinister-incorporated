import { authenticate } from "@/modules/auth/server";
import type { Page } from "@/modules/common/components/layouts/DefaultLayout/Navigation";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("profitDistributionCycle", "read"),
    authentication.authorize("profitDistributionCycle", "manage"),
  ]);

  const EnableProfitDistribution = await getUnleashFlag(
    UNLEASH_FLAG.EnableProfitDistribution,
  );

  const pages: Page[] = [];

  if (EnableProfitDistribution && (permissions[0] || permissions[1])) {
    pages.push({
      title: "Alle Zeiträume",
      url: "/app/sincome",
    });
  }

  return pages;
};
