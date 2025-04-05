import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { OpenTasksTile } from "@/tasks/components/OpenTasksTile";
import { Template } from "@/tasks/components/Template";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tasks | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/tasks");
  await authentication.authorizePage("task", "read");

  return (
    <Template>
      <Suspense fallback={<SkeletonTile className="mt-4 lg:mt-8" />}>
        <OpenTasksTile />
      </Suspense>
    </Template>
  );
}
