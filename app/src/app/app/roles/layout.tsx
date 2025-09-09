import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/common/components/layouts/MaxWidthContent";
import { getNavigationItems } from "@/iam/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="IAM" pages={pages} slug="iam">
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
