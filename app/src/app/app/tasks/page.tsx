import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/SidebarLayout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Filters } from "@/tasks/components/Filters";
import { TasksTile } from "@/tasks/components/TasksTile";
import { type Metadata } from "next";
import type { SearchParams } from "nuqs";

export const metadata: Metadata = {
  title: "Tasks | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app/tasks");
  await authentication.authorizePage("task", "read");

  return (
    <SidebarLayout sidebar={<Filters />}>
      <SuspenseWithErrorBoundaryTile>
        <TasksTile searchParams={searchParams} />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
