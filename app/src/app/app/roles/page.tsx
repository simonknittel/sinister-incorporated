import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "../../../lib/auth/server";
import { RolesTile } from "./_components/RolesTile";
import RolesTileSkeleton from "./_components/RolesTileSkeleton";

export const metadata: Metadata = {
  title: "Rollen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/roles");
  authentication.authorizePage("role", "manage");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <h1 className="text-xl font-bold">Rollen</h1>

      <Suspense fallback={<RolesTileSkeleton className="mt-4" />}>
        <RolesTile className="mt-4" />
      </Suspense>
    </main>
  );
}
