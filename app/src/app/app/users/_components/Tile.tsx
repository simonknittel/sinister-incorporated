import { prisma } from "@/db";
import Table from "./Table";

const Tile = async () => {
  const [users, entities] = await Promise.all([
    prisma.user.findMany({
      include: {
        accounts: true,
      },
    }),
    prisma.entity.findMany(),
  ]);

  const enrichedUsers = users.map((user) => {
    const entity = entities.find(
      (entity) => entity.discordId === user.accounts[0].providerAccountId,
    );

    if (!entity)
      return {
        user,
        discordId: user.accounts[0].providerAccountId,
      };

    return {
      user,
      discordId: user.accounts[0].providerAccountId,
      entity,
    };
  });

  return (
    <section className="p-4 lg:p-8 bg-neutral-800/50  rounded-2xl max-w-4xl mt-4">
      <Table users={enrichedUsers} />
    </section>
  );
};

export default Tile;
