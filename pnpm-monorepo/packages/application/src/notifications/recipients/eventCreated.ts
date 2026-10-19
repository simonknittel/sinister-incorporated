import type { ApplicationContext } from "../../context.js";
import {
  findNotifiableRecipients,
  loadEventRecipientWhere,
  type EventNotificationRecipients,
} from "./eventRecipients.js";

export interface FindEventCreatedRecipientsInput {
  readonly eventId: string;
}

/**
 * The citizens who can see the new event. Null when the event does not
 * exist.
 */
export const findEventCreatedRecipients = async (
  context: ApplicationContext,
  input: FindEventCreatedRecipientsInput,
): Promise<EventNotificationRecipients | null> => {
  const event = await context.prisma.event.findUnique({
    where: {
      id: input.eventId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  if (!event) return null;

  const recipientWhere = await loadEventRecipientWhere(context, event.id);
  if (!recipientWhere) return null;

  return {
    event,
    recipients: await findNotifiableRecipients(context, recipientWhere),
  };
};
