import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { ClosedTasksTile } from "@/tasks/components/ClosedTasksTile";
import { Template } from "@/tasks/components/Template";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tasks | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/tasks/history");
  await authentication.authorizePage("task", "read");

  return (
    <Template>
      <Suspense fallback={<SkeletonTile className="mt-4 lg:mt-8" />}>
        <ClosedTasksTile />
      </Suspense>
    </Template>
  );
}
