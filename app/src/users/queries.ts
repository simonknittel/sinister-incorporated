import { prisma } from "@/db";

export const getUsersWithEntities = async () => {
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

  return enrichedUsers;
};
