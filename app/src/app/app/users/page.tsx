import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { Tile } from "@/users/components/Tile";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Benutzer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/users");
  await authentication.authorizePage("user", "read");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <h1 className="text-xl font-bold">Benutzer</h1>

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <Tile className="mt-4" />
      </Suspense>
    </main>
  );
}
