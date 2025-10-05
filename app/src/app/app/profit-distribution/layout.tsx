import { authenticate } from "@/modules/auth/server";
import { DefaultLayout } from "@/modules/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/modules/common/components/layouts/MaxWidthContent";
import { CreateProfitDistributionCycleButton } from "@/modules/profit-distribution/components/CreateProfitDistributionCycleButton";
import { getNavigationItems } from "@/modules/profit-distribution/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const [pages, authentication] = await Promise.all([
    getNavigationItems(),
    authenticate(),
  ]);

  const showCta =
    authentication &&
    (await authentication.authorize("profitDistributionCycle", "create"));

  return (
    <DefaultLayout
      title="Gewinnverteilung"
      pages={pages}
      cta={showCta ? <CreateProfitDistributionCycleButton /> : undefined}
      slug="profit-distribution"
    >
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
