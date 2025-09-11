import { getNavigationItems } from "@/modules/account/utils/getNavigationItems";
import { DefaultLayout } from "@/modules/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/modules/common/components/layouts/MaxWidthContent";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="Account" pages={pages} slug="account">
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
