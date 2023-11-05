import { type Account, type Entity, type User } from "@prisma/client";
import { cache } from "react";
import { prisma } from "~/server/db";
import { authenticate } from "./auth/authenticateAndAuthorize";

export const getLastSeenAt = cache(async (entity: Entity) => {
  const authentication = await authenticate();
  if (!authentication) return undefined;

  let account: (Account & { user: User }) | null = null;

  if (
    authentication.authorize([
      {
        resource: "lastSeen",
        operation: "read",
      },
    ]) &&
    entity.discordId
  ) {
    account = await prisma.account.findFirst({
      where: {
        provider: "discord",
        providerAccountId: entity.discordId,
      },
      include: {
        user: true,
      },
    });
  }

  return account?.user.lastSeenAt;
});
