import type { Citizen, Prisma, Variant } from "@sam-monorepo/database/client";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import {
  getDiscordUserIdOfActor,
  isAllowedToManagePositions,
  isEventUpdatable,
  isLineupVisible,
} from "../events/eventManageRules.js";
import {
  toCitizenReference,
  toCitizenReferences,
  type CitizenReference,
} from "../events/eventOutput.js";
import { findVisibleEvent } from "../events/findVisibleEvent.js";
import { withSpan } from "../withSpan.js";
import { POSITION_TREE_INCLUDE } from "./positionTreeInclude.js";

export const getEventLineupInputSchema = z.object({
  event_id: z.cuid(),
});

export type GetEventLineupInput = z.infer<typeof getEventLineupInputSchema>;

export interface LineupPosition {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  /** The ship variants of the position, in their order */
  readonly required_variants: { readonly id: string; readonly name: string }[];
  /** Null when nobody is assigned or the assigned citizen is deleted */
  readonly assignee: CitizenReference | null;
  /** The citizens who applied for the position */
  readonly applications: CitizenReference[];
  readonly children: LineupPosition[];
}

export interface GetEventLineupOutput {
  readonly event: { readonly id: string; readonly name: string };
  readonly can_manage_positions: boolean;
  /** False when the event has ended: then the lineup cannot change */
  readonly is_updatable: boolean;
  readonly positions: LineupPosition[];
}

export type EventPositionTreeRow = Prisma.EventPositionGetPayload<{
  include: typeof POSITION_TREE_INCLUDE;
}>;

/**
 * The root positions of the lineup of an event, with their children four
 * levels deep. Carries no permission check: the caller resolves the event
 * first.
 */
export const findEventPositionTree = (
  context: ApplicationContext,
  eventId: string,
): Promise<EventPositionTreeRow[]> =>
  context.prisma.eventPosition.findMany({
    where: { eventId, parentPositionId: null },
    orderBy: { order: "asc" },
    include: POSITION_TREE_INCLUDE,
  });

type PositionCitizen = Pick<Citizen, "id" | "handle" | "deletedAt">;

/** One level of the position tree, as `POSITION_TREE_INCLUDE` loads it */
interface PositionTreeRow {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly requiredVariants: readonly {
    readonly variant: Pick<Variant, "id" | "name">;
  }[];
  readonly citizen: PositionCitizen | null;
  readonly applications: readonly { readonly citizen: PositionCitizen }[];
  /** Missing on the deepest level */
  readonly childPositions?: readonly PositionTreeRow[];
}

const toLineupPosition = (position: PositionTreeRow): LineupPosition => ({
  id: position.id,
  name: position.name,
  description: position.description,
  required_variants: position.requiredVariants.map(({ variant }) => ({
    id: variant.id,
    name: variant.name,
  })),
  assignee: toCitizenReference(position.citizen),
  applications: toCitizenReferences(
    position.applications.map((application) => application.citizen),
  ),
  children: (position.childPositions ?? []).map(toLineupPosition),
});

/**
 * The lineup of an event: the position tree with the required variants, the
 * assignees and the applications. The same checks as the lineup page of the
 * app: a citizen, `event;read`, `ship;read` (the page shows the own ships of
 * the required variants), the visibility of the event, and a lineup that is
 * enabled or that the actor can manage.
 */
export const getEventLineup = (
  context: ApplicationContext,
  actor: Actor,
  input: GetEventLineupInput,
): Promise<GetEventLineupOutput> =>
  withSpan(context, "getEventLineup", async () => {
    requirePermission(actor, "event", "read");
    requirePermission(actor, "ship", "read");

    if (!actor.citizen)
      throw new ForbiddenError("The user does not have a citizen");

    const [event, discordUserId] = await Promise.all([
      findVisibleEvent(context, actor, input.event_id),
      getDiscordUserIdOfActor(context, actor),
    ]);

    if (!isLineupVisible(actor, event, discordUserId))
      throw new ForbiddenError("The lineup of the event is not enabled");

    const positions = await findEventPositionTree(context, event.id);

    return {
      event: { id: event.id, name: event.name },
      can_manage_positions: isAllowedToManagePositions(
        actor,
        event,
        discordUserId,
      ),
      is_updatable: isEventUpdatable(event, context.now()),
      positions: positions.map(toLineupPosition),
    };
  });
