import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { OpenTasks } from "@/tasks/components/OpenTasks";
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
        <OpenTasks className="mt-4 lg:mt-8" />
      </Suspense>

      <div className="flex justify-center mt-2 lg:mt-4">
        <Link
          href="/app/tasks/history"
          className="text-sinister-red-500 hover:underline focus-visible:underline inline-block"
        >
          Vergangene Tasks
        </Link>
      </div>
    </Template>
  );
}
