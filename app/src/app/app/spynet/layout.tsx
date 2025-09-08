import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { getNavigationItems } from "@/spynet/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="Spynet" pages={pages} slug="spynet">
      {children}
    </DefaultLayout>
  );
}
