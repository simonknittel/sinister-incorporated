import type { Citizen, Event } from "@sam-monorepo/database/client";
import { getEventEndTime } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export type EventManageInput = Pick<
  Event,
  "discordCreatorId" | "createdById"
> & {
  readonly managers: readonly Pick<Citizen, "id">[];
};

/**
 * The Discord user id of the actor, or null for a user without a Discord
 * account. The same account as the `discordId` of the session of the app.
 */
export const getDiscordUserIdOfActor = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<string | null> => {
  const account = await context.prisma.account.findFirst({
    where: { userId: actor.userId, provider: "discord" },
    select: { providerAccountId: true },
  });

  return account?.providerAccountId ?? null;
};

/**
 * The organizers of an event manage it without a permission: the Discord
 * creator, the creator and the managers.
 */
const isEventOrganizer = (
  actor: Actor,
  event: EventManageInput,
  discordUserId: string | null,
) => {
  /**
   * The Discord creator of a Discord event keeps manage rights even when no
   * citizen is attached to their Discord id yet.
   */
  if (
    event.discordCreatorId !== null &&
    event.discordCreatorId === discordUserId
  )
    return true;

  const citizenId = actor.citizen?.id ?? null;
  if (citizenId === null) return false;

  if (event.createdById === citizenId) return true;

  /**
   * Managers are matched by citizen id, not Discord id, so a manager
   * without a Discord id does not silently lose access.
   */
  return event.managers.some((manager) => manager.id === citizenId);
};

/**
 * @param discordUserId The Discord user id of the actor (see
 * `getDiscordUserIdOfActor()`)
 */
export const isAllowedToManageEvent = (
  actor: Actor,
  event: EventManageInput,
  discordUserId: string | null,
) =>
  isEventOrganizer(actor, event, discordUserId) ||
  actor.authorize("event", "manage");

/**
 * @param discordUserId The Discord user id of the actor (see
 * `getDiscordUserIdOfActor()`)
 */
export const isAllowedToManagePositions = (
  actor: Actor,
  event: EventManageInput,
  discordUserId: string | null,
) =>
  isEventOrganizer(actor, event, discordUserId) ||
  actor.authorize("othersEventPosition", "manage");

/**
 * @param discordUserId The Discord user id of the actor (see
 * `getDiscordUserIdOfActor()`)
 */
export const isLineupVisible = (
  actor: Actor,
  event: EventManageInput & Pick<Event, "lineupEnabled">,
  discordUserId: string | null,
) =>
  event.lineupEnabled ||
  isAllowedToManagePositions(actor, event, discordUserId);

/** An event that has not ended yet can change */
export const isEventUpdatable = (
  event: Pick<Event, "startTime" | "endTime">,
  now: Date,
) => getEventEndTime(event) > now;
