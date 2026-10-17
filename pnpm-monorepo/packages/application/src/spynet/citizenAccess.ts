import type { Actor } from "../actor.js";
import { ForbiddenError } from "../errors.js";

/**
 * Throws a `ForbiddenError` when the actor can read neither the Spynet nor
 * the citizen. Each citizen can read the own citizen without
 * `citizen;read`, because the dashboard shows the own profile to everyone.
 */
export const requireCitizenReadAccess = (actor: Actor, citizenId: string) => {
  if (actor.citizen?.id === citizenId) return;
  if (actor.authorize("citizen", "read")) return;

  throw new ForbiddenError("The permission citizen;read is missing");
};
