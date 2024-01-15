import { type Metadata } from "next";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";
import { prisma } from "~/server/db";
import { RolesTile } from "./_components/RolesTile";
import { ShipsTile } from "./_components/ShipsTile";
import { SpynetTile } from "./_components/SpynetTile";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default async function Page() {
  if (!(await getUnleashFlag("EnableNewDashboard")))
    return (
      <main className="p-2 lg:p-8 pt-20">
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>

        <p className="italic text-neutral-500">
          Das Dashboard hat aktuell noch keine Funktion.
        </p>
      </main>
    );

  const authentication = await authenticatePage();

  const discordAccount = await prisma.account.findFirst({
    where: {
      userId: authentication.session.user.id,
    },
  });

  const entity = await prisma.entity.findUnique({
    where: {
      discordId: discordAccount!.providerAccountId,
    },
  });

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <SpynetTile entity={entity} />
      <RolesTile entity={entity} className="mt-4" />
      <ShipsTile className="mt-4" />
    </main>
  );
}
