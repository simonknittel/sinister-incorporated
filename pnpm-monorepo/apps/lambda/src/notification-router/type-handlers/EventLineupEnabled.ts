import {
  findEventParticipantRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Event } from "@sam-monorepo/database";
import { publishNotifications } from "../publish.js";

type Payload = {
  eventId: Event["id"];
};

export const EventLineupEnabledHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findEventParticipantRecipients(context, {
    eventId: payload.eventId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "event_lineup_enabled" as const,
      payload: { eventId: result.event.id, eventName: result.event.name },
      title: "Aufstellung veröffentlicht",
      body: result.event.name,
      url: `/app/events/${result.event.id}/lineup`,
    })),
  );
};
