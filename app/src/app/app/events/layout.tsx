import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { getNavigationItems } from "@/events/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const pages = await getNavigationItems();

  return (
    <DefaultLayout title="Events" pages={pages} slug="events">
      {children}
    </DefaultLayout>
  );
}
