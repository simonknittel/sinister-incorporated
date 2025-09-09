import { getNavigationItems } from "@/career/utils/getNavigationItems";
import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="Karriere" pages={pages} slug="career">
      {children}
    </DefaultLayout>
  );
}
