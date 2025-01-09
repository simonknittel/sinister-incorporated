import { authenticatePage } from "@/auth/server";
import { Flow } from "@/career/components/Flow";
import { Navigation } from "@/career/components/Navigation";
import { getMyReadableFlows } from "@/career/queries";
import { Hero } from "@/common/components/Hero";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { getRoles } from "@/roles/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Security - Karriere | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/career");
  await authentication.authorizePage("career", "read", [
    {
      key: "flowId",
      value: "security",
    },
  ]);

  const flows = await getMyReadableFlows();
  const flow = flows.find((flow) => flow.id === "security");
  if (!flow) notFound();

  const roles = await getRoles();

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center">
        <Hero text="Karriere" withGlitch />
      </div>

      <Navigation flows={flows} className="mt-2" />

      <Suspense fallback={<SkeletonTile className="h-[1080px] mt-2" />}>
        <div className="h-[1080px] bg-neutral-800/50 rounded-2xl overflow-hidden text-black mt-2">
          <Flow flow={flow} roles={roles} />
        </div>
      </Suspense>
    </main>
  );
}
