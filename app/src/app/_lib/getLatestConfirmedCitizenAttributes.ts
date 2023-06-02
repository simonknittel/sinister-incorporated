import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { prisma } from "~/server/db";
import { authenticate } from "./auth/authenticateAndAuthorize";

export default async function getLatestConfirmedCitizenAttributes(
  entity: Entity & {
    logs: (EntityLog & { attributes: EntityLogAttribute[] })[];
  }
) {
  const authentication = await authenticate();

  const handle = entity.logs.filter(
    (log) =>
      log.type === "handle" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
  )?.[0]?.content;

  const spectrumId = entity.logs.find((log) => log.type === "spectrum-id")!
    .content!;

  const discordId = entity.logs.filter(
    (log) =>
      log.type === "discordId" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
  )?.[0]?.content;

  const teamspeakId = entity.logs.filter(
    (log) =>
      log.type === "teamspeakId" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
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
    discordId,
    teamspeakId,
    createdAt: entity.createdAt,
    lastSeenAt: account?.user.lastSeenAt || undefined,
  };
}
