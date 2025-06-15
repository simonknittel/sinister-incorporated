import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Tile } from "@/users/components/Tile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Benutzer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/users");
  await authentication.authorizePage("user", "read");

  return (
    <main className="p-4 pb-20 lg:p-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Benutzer</h1>

      <SuspenseWithErrorBoundaryTile>
        <Tile />
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
