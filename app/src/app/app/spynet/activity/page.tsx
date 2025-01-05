import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { ActivityTile } from "@/spynet/components/ActivityTile/ActivityTile";
import { type Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Aktivität - Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/spynet/activity");
  await authentication.authorizePage("spynetActivity", "read");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Aktivität</h1>
      </div>

      <Suspense fallback={<SkeletonTile />}>
        <ActivityTile />
      </Suspense>
    </main>
  );
}
