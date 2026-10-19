import { WikiPageEventScope } from "@sam-monorepo/database/browser";
import type { ApplicationContext } from "../../context.js";
import { findEventParticipantRecipients } from "./eventParticipants.js";
import {
  findNotifiableRecipients,
  loadEventRecipientWhere,
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
      if (!input.readScopePositionId) return null;

      const event = await context.prisma.event.findUnique({
        where: { id: input.eventId },
        select: {
          id: true,
          name: true,
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

      /**
       * Citizens assigned anywhere in the subtree of the referenced position:
       * the same membership rule as the permission resolver of the app
       */
      const childrenByParent = Map.groupBy(
        event.positions,
        (position) => position.parentPositionId,
      );

      const subtreeIds = new Set<string>();
      const queue = [input.readScopePositionId];
      while (queue.length > 0) {
        const currentId = queue.pop()!;
        if (subtreeIds.has(currentId)) continue;
        subtreeIds.add(currentId);
        queue.push(
          ...(childrenByParent.get(currentId) ?? []).map((child) => child.id),
        );
      }

      const citizenIds = [
        ...new Set(
          event.positions
            .filter(
              (position) => position.citizenId && subtreeIds.has(position.id),
            )
            .map((position) => position.citizenId!),
        ),
      ];
      if (citizenIds.length <= 0) return null;

      const recipientWhere = await loadEventRecipientWhere(context, event.id);
      if (!recipientWhere) return null;

      return {
        event: { id: event.id, name: event.name },
        recipients: await findNotifiableRecipients(context, {
          AND: [{ id: { in: citizenIds } }, recipientWhere],
        }),
      };
    }

    case WikiPageEventScope.ALL: {
      const event = await context.prisma.event.findUnique({
        where: { id: input.eventId },
        select: { id: true, name: true },
      });
      if (!event) return null;

      const recipientWhere = await loadEventRecipientWhere(context, event.id);
      if (!recipientWhere) return null;

      return {
        event,
        recipients: await findNotifiableRecipients(context, recipientWhere),
      };
    }

    default:
      throw new Error(`Unknown read scope: ${input.readScope satisfies never}`);
  }
};
