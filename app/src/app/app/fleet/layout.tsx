import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { getNavigationItems } from "@/fleet/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="Flotte" pages={pages} slug="fleet">
      {children}
    </DefaultLayout>
  );
}
