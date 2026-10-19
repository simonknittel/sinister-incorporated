import type { ApplicationContext } from "../../context.js";
import type { EventNotificationRecipients } from "./eventRecipients.js";

export interface FindEventParticipationRecipientInput {
  readonly eventId: string;
  readonly citizenId: string;
}

/**
 * The citizen whom a manager added to the event or removed from it. The app
 * only lets a manager add citizens who can see the event, and a removal
 * keeps the view of the citizen on the event. Thus the single receiver needs
 * no further check. Null when the event does not exist.
 */
export const findEventParticipationRecipient = async (
  context: ApplicationContext,
  input: FindEventParticipationRecipientInput,
): Promise<EventNotificationRecipients | null> => {
  const event = await context.prisma.event.findUnique({
    where: { id: input.eventId },
    select: { id: true, name: true },
  });
  if (!event) return null;

  return { event, recipients: [{ citizenId: input.citizenId }] };
};
