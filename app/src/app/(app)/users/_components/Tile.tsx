import { prisma } from "~/server/db";
import Table from "./Table";

const Tile = async () => {
  const [users, entityLogs] = await Promise.all([
    prisma.user.findMany({
      include: {
        accounts: true,
      },
    }),
    prisma.entityLog.findMany({
      where: {
        type: "discord-id",
      },
      include: {
        attributes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const enrichedUsers = users.map((user) => {
    const discordIdLog = entityLogs.find((log) => {
      return (
        log.content === user.accounts[0]!.providerAccountId &&
        log.attributes.find(
          (attribute) =>
            attribute.key === "confirmed" && attribute.value === "confirmed",
        )
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
    <section className="p-4 lg:p-8 bg-neutral-900 rounded max-w-4xl mt-4">
      <Table users={enrichedUsers} />
    </section>
  );
};

export default Tile;
