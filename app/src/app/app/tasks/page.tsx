import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { CreateTask } from "@/tasks/components/CreateTask";
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
      <CreateTask />
      <Suspense fallback={<SkeletonTile />}></Suspense>
    </Template>
  );
}
