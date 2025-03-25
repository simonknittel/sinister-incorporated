import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { User } from "@prisma/client";

export const getUsersWithEntities = async () => {
  return getTracer().startActiveSpan("getUsersWithEntities", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("user", "read")))
        throw new Error("Forbidden");

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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

export const getUserById = async (id: User["id"]) => {
  return getTracer().startActiveSpan("getUserById", async (span) => {
    try {
      return await prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};
