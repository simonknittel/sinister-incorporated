import clsx from "clsx";
import { type Metadata } from "next";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import { EventsTile } from "./_components/EventsTile";
import { QuotesTile } from "./_components/QuotesTile";
import { RolesTile } from "./_components/RolesTile";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default async function Page() {
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
      <h1 className="sr-only">Dashboard</h1>

      <div className={clsx(styles.tileGrid)}>
        <EventsTile />
        <RolesTile entity={entity} />
        {/* <ShipsTile /> */}
      </div>

      <QuotesTile className="mt-4" />
    </main>
  );
}
