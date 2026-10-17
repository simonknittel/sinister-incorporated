import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import {
  getDiscordUserIdOfActor,
  isAllowedToManageEvent,
  isAllowedToManagePositions,
  isEventUpdatable,
} from "./eventManageRules.js";
import {
  toCitizenReference,
  toCitizenReferences,
  toEventSourceType,
  toEventVisibilityType,
  type CitizenReference,
  type EventSourceType,
  type EventVisibilityType,
} from "./eventOutput.js";
import type { EventDetails } from "./eventSelects.js";
import { findVisibleEvent } from "./findVisibleEvent.js";
import { buildParticipantCitizenWhere } from "./participantCitizenWhere.js";

export const getEventInputSchema = z.object({
  event_id: z.cuid(),
});

export type GetEventInput = z.infer<typeof getEventInputSchema>;

export interface EventParticipantEntry {
  /**
   * Null when the citizen is deleted, or when no citizen has the Discord id
   * of a Discord sign-up
   */
  readonly citizen: CitizenReference | null;
  /** Null without the permission `discord-id;read` */
  readonly discord_user_id: string | null;
  readonly comment: string | null;
  readonly created_at: string;
}

export interface GetEventOutput {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly start_time: string;
  /** Null when the event has no explicit end */
  readonly end_time: string | null;
  readonly location: string | null;
  readonly visibility: EventVisibilityType;
  /** The roles that see a restricted event */
  readonly visibility_role_ids: string[];
  readonly source: EventSourceType;
  readonly lineup_enabled: boolean;
  readonly created_by: CitizenReference | null;
  readonly managers: CitizenReference[];
  /** The active participations, in the order of the sign-up */
  readonly participants: EventParticipantEntry[];
  readonly can_manage: boolean;
  readonly can_manage_positions: boolean;
  /** False when the event has ended: then nothing can change */
  readonly is_updatable: boolean;
  readonly is_participating: boolean;
}

const getParticipantEntries = async (
  context: ApplicationContext,
  actor: Actor,
  participants: EventDetails["participants"],
): Promise<EventParticipantEntry[]> => {
  const citizens = await context.prisma.citizen.findMany({
    where: buildParticipantCitizenWhere(participants),
    select: { id: true, handle: true, deletedAt: true, discordId: true },
  });
  const canReadDiscordIds = actor.authorize("discord-id", "read");

  return participants
    .toSorted(
      (first, second) => first.createdAt.getTime() - second.createdAt.getTime(),
    )
    .map((participant) => {
      // A Discord id finds only citizens that are not deleted, like
      // `buildParticipantCitizenWhere()`
      const citizen = participant.citizenId
        ? citizens.find((citizen) => citizen.id === participant.citizenId)
        : citizens.find(
            (citizen) =>
              citizen.deletedAt === null &&
              participant.discordUserId !== null &&
              citizen.discordId === participant.discordUserId,
          );

      return {
        citizen: toCitizenReference(citizen ?? null),
        discord_user_id: canReadDiscordIds ? participant.discordUserId : null,
        comment: participant.comment,
        created_at: participant.createdAt.toISOString(),
      };
    });
};

/**
 * One event that the actor can see, with its participants and managers and
 * what the actor can do with it
 */
export const getEvent = (
  context: ApplicationContext,
  actor: Actor,
  input: GetEventInput,
): Promise<GetEventOutput> =>
  withSpan(context, "getEvent", async () => {
    requirePermission(actor, "event", "read");

    // Like the participants page of the app, which requires a citizen
    if (!actor.citizen)
      throw new ForbiddenError("The user does not have a citizen");

    const event = await findVisibleEvent(context, actor, input.event_id);

    const [participants, discordUserId] = await Promise.all([
      getParticipantEntries(context, actor, event.participants),
      getDiscordUserIdOfActor(context, actor),
    ]);

    const citizenId = actor.citizen.id;

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      start_time: event.startTime.toISOString(),
      end_time: event.endTime?.toISOString() ?? null,
      location: event.location,
      visibility: toEventVisibilityType(event.visibility),
      visibility_role_ids: event.visibilityRoles.map(
        (visibilityRole) => visibilityRole.roleId,
      ),
      source: toEventSourceType(event.source),
      lineup_enabled: event.lineupEnabled,
      created_by: toCitizenReference(event.createdBy),
      managers: toCitizenReferences(event.managers),
      participants,
      can_manage: isAllowedToManageEvent(actor, event, discordUserId),
      can_manage_positions: isAllowedToManagePositions(
        actor,
        event,
        discordUserId,
      ),
      is_updatable: isEventUpdatable(event, context.now()),
      is_participating: event.participants.some(
        (participant) =>
          participant.citizenId === citizenId ||
          (discordUserId !== null &&
            participant.discordUserId === discordUserId),
      ),
    };
  });
