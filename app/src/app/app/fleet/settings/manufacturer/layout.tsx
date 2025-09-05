import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { Navigation } from "@/fleet/components/Navigation/Navigation";
import { type ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
  readonly breadcrumbs?: ReactNode;
}

export default function Layout({ children, breadcrumbs }: Props) {
  return (
    <SidebarLayout title="Flotte" sidebar={<Navigation />}>
      <div className="mb-4 text-xl">{breadcrumbs}</div>

      {children}
    </SidebarLayout>
  );
}
