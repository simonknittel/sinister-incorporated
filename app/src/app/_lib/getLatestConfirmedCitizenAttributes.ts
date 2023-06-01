import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";

export default function getLatestConfirmedCitizenAttributes(
  entity: Entity & {
    logs: (EntityLog & { attributes: EntityLogAttribute[] })[];
  }
) {
  const latestConfirmedHandle = entity.logs.filter(
    (log) =>
      log.type === "handle" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
  )?.[0]?.content;

  const spectrumId = entity.logs.find((log) => log.type === "spectrum-id")!
    .content!;

  const latestConfirmedDiscordId = entity.logs.filter(
    (log) =>
      log.type === "discordId" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
  )?.[0]?.content;

  const latestConfirmedTeamspeakId = entity.logs.filter(
    (log) =>
      log.type === "teamspeakId" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "confirmed"
      )
  )?.[0]?.content;

  return {
    id: entity.id,
    handle: latestConfirmedHandle,
    spectrumId,
    discordId: latestConfirmedDiscordId,
    teamspeakId: latestConfirmedTeamspeakId,
    createdAt: entity.createdAt,
    lastSeenAt: new Date(), // TODO
  };
}
