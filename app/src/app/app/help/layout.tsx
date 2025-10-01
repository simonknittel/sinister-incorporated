import { DefaultLayout } from "@/modules/common/components/layouts/DefaultLayout";
import { getNavigationItems } from "@/modules/help/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="Hilfe" slug="help" pages={pages}>
      {children}
    </DefaultLayout>
  );
}
