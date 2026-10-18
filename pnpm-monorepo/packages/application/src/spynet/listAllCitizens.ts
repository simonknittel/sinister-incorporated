import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/** A citizen as the pickers of the app offer it */
export interface PickableCitizen {
  readonly id: string;
  readonly handle: string | null;
  readonly deletedAt: Date | null;
}

/**
 * Each active citizen as the pickers offer them: the combobox searches the
 * handle and submits the id, and the mention suggestions of the wiki do the
 * same. The list has no limit and goes to the browser, thus it carries
 * nothing else. Requires `citizen;read`.
 */
export const listAllCitizens = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<PickableCitizen[]> => {
  requirePermission(actor, "citizen", "read");

  return context.prisma.citizen.findMany({
    where: ACTIVE_CITIZEN_WHERE,
    select: { id: true, handle: true, deletedAt: true },
  });
};
