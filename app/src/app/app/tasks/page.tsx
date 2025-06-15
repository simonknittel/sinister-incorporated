import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { OpenTasksTile } from "@/tasks/components/OpenTasksTile";
import { Template } from "@/tasks/components/Template";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/tasks");
  await authentication.authorizePage("task", "read");

  return (
    <Template>
      <SuspenseWithErrorBoundaryTile className="mt-4 lg:mt-6">
        <OpenTasksTile />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
