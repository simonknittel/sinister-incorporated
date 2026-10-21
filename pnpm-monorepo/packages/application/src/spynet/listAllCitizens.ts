import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import {
  CITIZEN_REFERENCE_SELECT,
  type CitizenReferenceRow,
} from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";

/** A citizen as the pickers of the app offer it */
export type PickableCitizen = CitizenReferenceRow;

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
    select: CITIZEN_REFERENCE_SELECT,
  });
};
