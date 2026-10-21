import { WikiPageEventScope } from "@sam-monorepo/database/browser";
import {
  buildEventRecipientWhere,
  collectPositionScopeIdsForCitizen,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../../context.js";
import { findEventCreatedRecipients } from "./eventCreated.js";
import { findEventParticipantRecipients } from "./eventParticipants.js";
import {
  EVENT_RECIPIENT_SELECT,
  findNotifiableRecipients,
  type EventNotificationRecipients,
} from "./eventRecipients.js";

/** The read scopes that open the briefing to more citizens than the managers */
export type PublishedBriefingReadScope = Exclude<
  WikiPageEventScope,
  typeof WikiPageEventScope.INHERIT | typeof WikiPageEventScope.MANAGERS
>;

export interface FindEventBriefingPublishedRecipientsInput {
  readonly eventId: string;
  /** The read scope of the root page at the time of the publication */
  readonly readScope: PublishedBriefingReadScope;
  readonly readScopePositionId: string | null;
}

/**
 * The audience of the new read scope of the briefing, thus nobody hears
 * about a briefing that they cannot open. Null when the event, the position
 * or the audience does not exist.
 */
export const findEventBriefingPublishedRecipients = async (
  context: ApplicationContext,
  input: FindEventBriefingPublishedRecipientsInput,
): Promise<EventNotificationRecipients | null> => {
  switch (input.readScope) {
    case WikiPageEventScope.PARTICIPANTS:
      return findEventParticipantRecipients(context, {
        eventId: input.eventId,
      });

    case WikiPageEventScope.POSITION: {
      const scopePositionId = input.readScopePositionId;
      if (!scopePositionId) return null;

      const event = await context.prisma.event.findUnique({
        where: { id: input.eventId },
        select: {
          id: true,
          name: true,
          ...EVENT_RECIPIENT_SELECT,
          positions: {
            select: {
              id: true,
              parentPositionId: true,
              citizenId: true,
            },
          },
        },
      });
      if (!event) return null;

      // The rule of the briefing gate: a citizen with a position in the
      // subtree of the scope position
      const citizenIds = [
        ...new Set(
          event.positions.flatMap((position) =>
            position.citizenId ? [position.citizenId] : [],
          ),
        ),
      ].filter((citizenId) =>
        collectPositionScopeIdsForCitizen(event.positions, citizenId).has(
          scopePositionId,
        ),
      );
      if (citizenIds.length <= 0) return null;

      return {
        event: { id: event.id, name: event.name },
        recipients: await findNotifiableRecipients(context, {
          AND: [{ id: { in: citizenIds } }, buildEventRecipientWhere(event)],
        }),
      };
    }

    case WikiPageEventScope.ALL:
      return findEventCreatedRecipients(context, { eventId: input.eventId });

    default:
      throw new Error(`Unknown read scope: ${input.readScope satisfies never}`);
  }
};
