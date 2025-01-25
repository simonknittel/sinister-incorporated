import { prisma } from "@/db";
import { trace } from "@opentelemetry/api";
import type { User } from "@prisma/client";

export const getUsersWithEntities = async () => {
  return await trace
    .getTracer("sam")
    .startActiveSpan("getUsersWithEntities", async (span) => {
      try {
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
      } finally {
        span.end();
      }
    });
};

export const getUserById = async (id: User["id"]) => {
  return await trace
    .getTracer("sam")
    .startActiveSpan("getUserById", async (span) => {
      try {
        return prisma.user.findUnique({
          where: {
            id,
          },
        });
      } finally {
        span.end();
      }
    });
};
