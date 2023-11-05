import { type Entity } from "@prisma/client";
import { prisma } from "~/server/db";
import { authenticate } from "./auth/authenticateAndAuthorize";

export async function getLastSeenAt(entity: Entity) {
  const authentication = await authenticate();

  let account;
  if (
    authentication &&
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

  return account?.user.lastSeenAt || undefined;
}
