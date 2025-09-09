import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/SidebarLayout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Filters } from "@/tasks/components/Filters";
import { TasksTile } from "@/tasks/components/TasksTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | S.A.M. - Sinister Incorporated",
};

export default async function Page({ searchParams }: PageProps<"/app/tasks">) {
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
