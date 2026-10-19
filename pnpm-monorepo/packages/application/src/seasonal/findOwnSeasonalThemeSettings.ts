import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export interface OwnSeasonalThemeSetting {
  readonly eventKey: string;
}

/**
 * The opt-out rows of the actor. A row means the citizen switched the event
 * off; an event without a row is switched on. Null for an actor without a
 * citizen: such an actor has no rows and cannot create any.
 */
export const findOwnSeasonalThemeSettings = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<OwnSeasonalThemeSetting[] | null> => {
  const citizenId = actor.citizen?.id;
  if (!citizenId) return null;

  return context.prisma.seasonalThemeSetting.findMany({
    where: { citizenId },
    select: { eventKey: true },
  });
};
