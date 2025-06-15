import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { ClosedTasksTile } from "@/tasks/components/ClosedTasksTile";
import { Template } from "@/tasks/components/Template";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/tasks/history");
  await authentication.authorizePage("task", "read");

  return (
    <Template>
      <SuspenseWithErrorBoundaryTile className="mt-4 lg:mt-6">
        <ClosedTasksTile />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
