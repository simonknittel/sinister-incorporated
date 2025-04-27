import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { ActivityTile } from "@/spynet/components/ActivityTile/ActivityTile";
import { type Metadata } from "next";

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

      <SuspenseWithErrorBoundaryTile>
        <ActivityTile />
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
