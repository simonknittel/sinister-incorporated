import {
  findEventCreatedRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Event } from "@sam-monorepo/database";
import { publishNotifications } from "../publish.js";

type Payload = {
  eventId: Event["id"];
};

export const EventCreatedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findEventCreatedRecipients(context, {
    eventId: payload.eventId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "event_created" as const,
      payload: { eventId: result.event.id, eventName: result.event.name },
      title: "Neues Event",
      body: result.event.name,
      url: `/app/events/${result.event.id}`,
    })),
  );
};
