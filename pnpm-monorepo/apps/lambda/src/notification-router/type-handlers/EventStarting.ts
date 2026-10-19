import {
  findEventParticipantRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Event } from "@sam-monorepo/database";
import { publishNotifications } from "../publish.js";

type Payload = {
  eventId: Event["id"];
};

export const EventStartingHandler = async (
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
      notificationType: "event_starting" as const,
      payload: { eventId: result.event.id, eventName: result.event.name },
      title: "Event beginnt in 15 Minuten",
      body: result.event.name,
      url: `/app/events/${result.event.id}`,
    })),
    {
      TTL: 15 * 60, // 15 minutes in seconds
      urgency: "high",
    },
  );
};
