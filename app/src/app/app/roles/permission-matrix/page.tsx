import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { PermissionMatrix } from "@/roles/components/PermissionMatrix";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Berechtigungsmatrix - Rollen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/roles/permission-matrix");
  await authentication.authorizePage("role", "manage");

  return (
    <main className="p-4 pb-20 lg:p-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Berechtigungsmatrix</h1>
      </div>

      <SuspenseWithErrorBoundaryTile>
        <PermissionMatrix />
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
