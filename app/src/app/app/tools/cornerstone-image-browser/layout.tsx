import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/common/components/layouts/MaxWidthContent";
import { getNavigationItems } from "@/cornerstone-image-browser/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout
      title="Cornerstone Image Browser"
      pages={pages}
      slug="tools/cornerstone-image-browser"
    >
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
