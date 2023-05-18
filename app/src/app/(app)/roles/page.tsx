import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticateAndAuthorizePage } from "~/app/_utils/authenticateAndAuthorize";
import Roles from "./_components/Roles";
import RolesSkeleton from "./_components/RolesSkeleton";

export const metadata: Metadata = {
  title: "Rollen und Berechtigungen | Sinister Incorporated",
};

export default async function Page() {
  await authenticateAndAuthorizePage("edit-roles-and-permissions");

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Rollen und Berechtigungen</h1>

      <Suspense fallback={<RolesSkeleton />}>
        <Roles />
      </Suspense>
    </main>
  );
}
