import { requireAuthenticationPage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Filters } from "@/tasks/components/Filters";
import { NotificationsTooltip } from "@/tasks/components/NotificationsTooltip";
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
  const showCreateTask = await authentication.authorize("task", "create");

  return (
    <div className="p-4 pb-20 lg:pb-4">
      <div className="flex justify-center items-center gap-2 mb-4">
        <Hero text="Tasks" withGlitch size="md" /> <NotificationsTooltip />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Filters
          className="md:w-64 md:flex-none"
          showCreateTask={showCreateTask}
        />

        <main className="md:flex-1">
          <SuspenseWithErrorBoundaryTile>
            <TasksTile searchParams={searchParams} />
          </SuspenseWithErrorBoundaryTile>
        </main>
      </div>
    </div>
  );
}
