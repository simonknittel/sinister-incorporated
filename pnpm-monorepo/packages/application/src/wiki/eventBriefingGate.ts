import {
  WikiPageEventScope,
  WikiPageNamespace,
  type Event,
  type EventParticipant,
} from "@sam-monorepo/database/client";
import { collectPositionScopeIdsForCitizen } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  isAllowedToManageEvent,
  type EventManageInput,
} from "../events/eventManageRules.js";

/**
 * An event as a list of events gives it (see `EventListRow`). The
 * participants are the rows of the actor only. That is sufficient for the
 * check if the actor takes part.
 */
export type EventBriefingGateEvent = EventManageInput &
  Pick<Event, "id"> & {
    readonly participants: readonly Pick<
      EventParticipant,
      "citizenId" | "discordUserId"
    >[];
  };

/**
 * Whether the actor may read the briefing of an event — the same rule that
 * gates the Briefing tab, evaluated from the root page alone (it has no
 * parent to inherit from or be gated by). Built for event tiles, which render
 * several events per page: one indexed root-page lookup per event, plus the
 * lineup only when a POSITION scope asks for it. Callers must have checked
 * `event;read`, like every event list does.
 *
 * Deliberately ignores the edit scope although the resolver's "may edit ⇒
 * may read" implication could widen reading: this stays equivalent only
 * because `updateEventWikiPagePermissions` enforces edit ⊆ read on every
 * root update (and the seed starts at MANAGERS/MANAGERS). Relaxing that
 * subset rule would silently desync tab and tile visibility from actual
 * readability.
 */
export const canReadEventBriefing = async (
  context: ApplicationContext,
  actor: Actor,
  event: EventBriefingGateEvent,
): Promise<boolean> => {
  const rootPage = await context.prisma.wikiPage.findFirst({
    where: {
      namespace: WikiPageNamespace.EVENT,
      eventId: event.id,
      parentId: null,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
    select: { eventReadScope: true, eventReadScopePositionId: true },
  });
  if (!rootPage) return false;

  if (isAllowedToManageEvent(actor, event)) return true;

  switch (rootPage.eventReadScope) {
    case WikiPageEventScope.ALL:
      return true;

    case WikiPageEventScope.PARTICIPANTS:
      return event.participants.some(
        (participant) =>
          (participant.discordUserId !== null &&
            participant.discordUserId === actor.discordUserId) ||
          (participant.citizenId !== null &&
            participant.citizenId === actor.citizen?.id),
      );

    case WikiPageEventScope.POSITION: {
      const citizenId = actor.citizen?.id ?? null;
      if (!rootPage.eventReadScopePositionId || !citizenId) return false;

      const positions = await context.prisma.eventPosition.findMany({
        where: { eventId: event.id },
        select: { id: true, parentPositionId: true, citizenId: true },
      });
      return collectPositionScopeIdsForCitizen(positions, citizenId).has(
        rootPage.eventReadScopePositionId,
      );
    }

    case WikiPageEventScope.MANAGERS:
      return false;

    /** Not allowed on root pages; the resolver's fallback is managers-only */
    case WikiPageEventScope.INHERIT:
      return false;

    default:
      throw new Error(
        `Unexpected scope: ${rootPage.eventReadScope satisfies never}`,
      );
  }
};
