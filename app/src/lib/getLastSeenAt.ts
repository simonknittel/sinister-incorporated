import { type Account, type Entity, type User } from "@prisma/client";
import { cache } from "react";
import { prisma } from "../server/db";
import { requireAuthentication } from "./auth/authenticateAndAuthorize";

export const getLastSeenAt = cache(async (entity: Entity) => {
  const authentication = await requireAuthentication();

  let account: (Account & { user: User }) | null = null;

  if (authentication.authorize("lastSeen", "read") && entity.discordId) {
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
