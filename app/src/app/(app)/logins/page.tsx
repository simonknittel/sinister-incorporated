import { type Metadata } from "next";
import { authenticateAndAuthorizePage } from "~/app/_utils/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import UsersTable from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Logins | Sinister Incorporated",
};

export default async function Page() {
  await authenticateAndAuthorizePage("view-logins");

  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  });

  const entityLogs = (
    await prisma.entityLog.findMany({
      where: {
        type: "discord-id",
      },
      include: {
        attributes: true,
      },
    })
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const enrichedUsers = users.map((user) => {
    const discordIdLog = entityLogs.find((log) => {
      return (
        log.content === user.accounts[0]!.providerAccountId &&
        log.attributes.find((attribute) => attribute.key === "confirmed")
      );
    });

    const entityId = discordIdLog?.entityId;

    if (!entityId)
      return {
        user,
        discordId: user.accounts[0]!.providerAccountId,
      };

    return {
      user,
      discordId: user.accounts[0]!.providerAccountId,
      entityId,
    };
  });

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Logins</h1>

      <section className="p-4 lg:p-8 bg-neutral-900 rounded max-w-4xl mt-4">
        <UsersTable users={enrichedUsers} />
      </section>
    </main>
  );
}
