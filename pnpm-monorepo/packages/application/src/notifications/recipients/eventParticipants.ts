import type { ApplicationContext } from "../../context.js";
import {
  findNotifiableRecipients,
  loadEventRecipientWhere,
  type EventNotificationRecipients,
} from "./eventRecipients.js";

export interface FindEventParticipantRecipientsInput {
  readonly eventId: string;
}

/**
 * The active participants of the event (app sign-ups by citizen id, Discord
 * RSVPs by Discord id), narrowed to the citizens who can see the event. Null
 * when the event does not exist or has no active participant.
 */
export const findEventParticipantRecipients = async (
  context: ApplicationContext,
  input: FindEventParticipantRecipientsInput,
): Promise<EventNotificationRecipients | null> => {
  const event = await context.prisma.event.findUnique({
    where: {
      id: input.eventId,
    },
    select: {
      id: true,
      name: true,
      participants: {
        where: { cancelledAt: null },
        select: {
          discordUserId: true,
          citizenId: true,
        },
      },
    },
  });
  if (!event || event.participants.length <= 0) return null;

  const recipientWhere = await loadEventRecipientWhere(context, event.id);
  if (!recipientWhere) return null;

  const discordUserIds = event.participants
    .map((participant) => participant.discordUserId)
    .filter((discordUserId): discordUserId is string => discordUserId !== null);
  const citizenIds = event.participants
    .map((participant) => participant.citizenId)
    .filter((citizenId): citizenId is string => citizenId !== null);

  const recipients = await findNotifiableRecipients(context, {
    AND: [
      {
        OR: [{ discordId: { in: discordUserIds } }, { id: { in: citizenIds } }],
      },
      recipientWhere,
    ],
  });

  return { event: { id: event.id, name: event.name }, recipients };
};
