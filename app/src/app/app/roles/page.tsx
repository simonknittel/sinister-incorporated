import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { RolesTile } from "@/roles/components/RolesTile";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Rollen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/roles");
  await authentication.authorizePage("role", "manage");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <h1 className="text-xl font-bold">Rollen</h1>

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <RolesTile className="mt-4" />
      </Suspense>
    </main>
  );
}
