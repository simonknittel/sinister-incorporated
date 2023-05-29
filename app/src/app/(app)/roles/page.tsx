import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import RolesTile from "./_components/RolesTile";
import RolesTileSkeleton from "./_components/RolesTileSkeleton";

export const metadata: Metadata = {
  title: "Rollen | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "role",
      operation: "manage",
    },
  ]);

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Rollen</h1>

      <Suspense fallback={<RolesTileSkeleton className="mt-4" />}>
        <RolesTile className="mt-4" />
      </Suspense>
    </main>
  );
}
