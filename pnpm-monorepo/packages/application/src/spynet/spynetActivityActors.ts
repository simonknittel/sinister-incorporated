import { requirePermission, type Actor } from "../actor.js";
import {
  CITIZEN_REFERENCE_SELECT,
  type CitizenReferenceRow,
} from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";

const ACTOR_SELECT = {
  createdBy: { select: CITIZEN_REFERENCE_SELECT },
} as const;

/** The citizen who caused an entry of the Spynet activity */
export type SpynetActivityActor = CitizenReferenceRow;

/**
 * Everyone who caused at least one entry the reader may see, for the actor
 * filter, sorted by their handle. Sources the reader has no access to
 * contribute nobody, so the filter never advertises names the table could not
 * show entries for. Requires `spynetActivity;read`.
 */
export const findSpynetActivityActors = (
  context: Pick<ApplicationContext, "prisma" | "tracer">,
  actor: Actor,
): Promise<SpynetActivityActor[]> =>
  withSpan(context, "findSpynetActivityActors", async () => {
    requirePermission(actor, "spynetActivity", "read");

    const canReadOrganizations = actor.authorize("organization", "read");
    const canReadRoles = actor.authorize("otherRole", "read");

    const rows = await Promise.all([
      canReadOrganizations
        ? context.prisma.organization.findMany({
            distinct: ["createdById"],
            select: ACTOR_SELECT,
          })
        : [],

      canReadOrganizations
        ? context.prisma.organizationAttributeHistoryEntry.findMany({
            distinct: ["createdById"],
            select: ACTOR_SELECT,
          })
        : [],

      canReadOrganizations
        ? context.prisma.organizationMembershipHistoryEntry.findMany({
            distinct: ["createdById"],
            select: ACTOR_SELECT,
          })
        : [],

      canReadRoles
        ? context.prisma.roleAssignmentChange.findMany({
            where: { createdById: { not: null } },
            distinct: ["createdById"],
            select: ACTOR_SELECT,
          })
        : [],

      canReadRoles
        ? context.prisma.roleAssignmentLevelChange.findMany({
            where: { createdById: { not: null } },
            distinct: ["createdById"],
            select: ACTOR_SELECT,
          })
        : [],
    ]);

    const actorsById = new Map<string, SpynetActivityActor>();
    for (const row of rows.flat()) {
      if (row.createdBy) actorsById.set(row.createdBy.id, row.createdBy);
    }

    return Array.from(actorsById.values()).toSorted((first, second) =>
      (first.handle || first.id).localeCompare(second.handle || second.id),
    );
  });
