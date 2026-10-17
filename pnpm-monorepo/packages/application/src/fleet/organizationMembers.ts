import { OrganizationMembershipVisibility } from "@sam-monorepo/database/browser";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/**
 * The citizens with an active membership in the organization that the actor
 * can see: the same rule as the member list of the organization page. A
 * redacted membership needs the `alsoVisibilityRedacted` attribute.
 */
export const getVisibleMemberCitizenIds = async (
  context: ApplicationContext,
  actor: Actor,
  organizationId: string,
): Promise<string[]> => {
  requirePermission(actor, "organizationMembership", "read");

  const alsoVisibilityRedacted = actor.authorize(
    "organizationMembership",
    "read",
    [{ key: "alsoVisibilityRedacted", value: true }],
  );

  const memberships =
    await context.prisma.activeOrganizationMembership.findMany({
      where: {
        organizationId,
        citizen: ACTIVE_CITIZEN_WHERE,
        visibility: {
          in: alsoVisibilityRedacted
            ? [
                OrganizationMembershipVisibility.PUBLIC,
                OrganizationMembershipVisibility.REDACTED,
              ]
            : [OrganizationMembershipVisibility.PUBLIC],
        },
      },
      select: { citizenId: true },
    });

  return memberships.map((membership) => membership.citizenId);
};
