import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/common/components/layouts/MaxWidthContent";
import { getNavigationItems } from "@/silc/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="SILC" pages={pages} slug="silc">
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
