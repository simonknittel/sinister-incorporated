import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { prisma } from "~/server/db";
import { authenticate } from "./auth/authenticateAndAuthorize";

export async function getLatestConfirmedCitizenAttributes(
  entity: Entity & {
    logs: (EntityLog & { attributes: EntityLogAttribute[] })[];
  },
) {
  const authentication = await authenticate();

  const handle = getLatestConfirmedCitizenHandle(entity.logs);

  const spectrumId = entity.logs.find((log) => log.type === "spectrum-id")!
    .content!;

  const discordId = entity.logs.filter(
    (log) =>
      log.type === "discord-id" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed",
      ),
  )?.[0]?.content;

  const teamspeakId = entity.logs.filter(
    (log) =>
      log.type === "teamspeak-id" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed",
      ),
  )?.[0]?.content;

  let account;
  if (
    authentication &&
    authentication.authorize([
      {
        resource: "lastSeen",
        operation: "read",
      },
    ]) &&
    discordId
  ) {
    account = await prisma.account.findFirst({
      where: {
        provider: "discord",
        providerAccountId: discordId,
      },
      include: {
        user: true,
      },
    });
  }

  return {
    id: entity.id,
    handle,
    spectrumId,
    "discord-id": discordId,
    "teamspeak-id": teamspeakId,
    createdAt: entity.createdAt,
    lastSeenAt: account?.user.lastSeenAt || undefined,
  };
}

export function getLatestConfirmedCitizenHandle(
  entityLogs: (EntityLog & { attributes: EntityLogAttribute[] })[],
) {
  return entityLogs.filter(
    (log) =>
      log.type === "handle" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed",
      ),
  )?.[0]?.content;
}
