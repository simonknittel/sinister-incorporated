import { getNavigationItems } from "@/account/utils/getNavigationItems";
import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/common/components/layouts/MaxWidthContent";
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
