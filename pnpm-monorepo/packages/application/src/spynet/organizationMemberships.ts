import { OrganizationMembershipVisibility } from "@sam-monorepo/database/browser";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/** The organization logos are hotlinked from the website they are scraped from */
const ORGANIZATION_LOGO_BASE_URL = "https://robertsspaceindustries.com";

export enum MembershipVisibility {
  Public = "public",
  Redacted = "redacted",
}

export interface CitizenReference {
  readonly id: string;
  /** Display text. It can change and it does not identify the citizen. */
  readonly handle: string | null;
}

export interface OrganizationReference {
  readonly id: string;
  readonly name: string;
  readonly logo_url: string | null;
}

export interface OrganizationMemberOutput {
  readonly citizen: CitizenReference;
  readonly visibility: MembershipVisibility;
}

export interface CitizenMembershipOutput {
  readonly organization: OrganizationReference;
  readonly visibility: MembershipVisibility;
}

/** The logo is a path on the website of Star Citizen, for example `/media/…` */
export const getOrganizationLogoUrl = (logo: string | null) =>
  logo ? new URL(logo, ORGANIZATION_LOGO_BASE_URL).href : null;

const toMembershipVisibility = (
  visibility: OrganizationMembershipVisibility,
) => {
  switch (visibility) {
    case OrganizationMembershipVisibility.PUBLIC:
      return MembershipVisibility.Public;

    case OrganizationMembershipVisibility.REDACTED:
      return MembershipVisibility.Redacted;

    default:
      throw new Error(`Unknown visibility: ${visibility satisfies never}`);
  }
};

/**
 * A redacted membership needs `organizationMembership;read` with the
 * attribute `alsoVisibilityRedacted`
 */
const getReadableVisibilities = (actor: Actor) =>
  actor.authorize("organizationMembership", "read", [
    { key: "alsoVisibilityRedacted", value: true },
  ])
    ? [
        OrganizationMembershipVisibility.PUBLIC,
        OrganizationMembershipVisibility.REDACTED,
      ]
    : [OrganizationMembershipVisibility.PUBLIC];

/**
 * The current members of the organization that the actor can see, sorted by
 * their handle. Deleted citizens are not members.
 */
export const listActiveOrganizationMemberships = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  organizationId: string,
): Promise<OrganizationMemberOutput[]> => {
  requirePermission(actor, "organizationMembership", "read");

  const memberships =
    await context.prisma.activeOrganizationMembership.findMany({
      where: {
        organizationId,
        citizen: ACTIVE_CITIZEN_WHERE,
        visibility: { in: getReadableVisibilities(actor) },
      },
      select: {
        visibility: true,
        citizen: { select: { id: true, handle: true } },
      },
    });

  return memberships
    .map((membership) => ({
      citizen: membership.citizen,
      visibility: toMembershipVisibility(membership.visibility),
    }))
    .sort((first, second) =>
      (first.citizen.handle || first.citizen.id).localeCompare(
        second.citizen.handle || second.citizen.id,
      ),
    );
};

/**
 * The current organizations of the citizen that the actor can see, sorted
 * by their name
 */
export const listOrganizationMembershipsOfCitizen = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  citizenId: string,
): Promise<CitizenMembershipOutput[]> => {
  requirePermission(actor, "organizationMembership", "read");

  const memberships =
    await context.prisma.activeOrganizationMembership.findMany({
      where: {
        citizenId,
        visibility: { in: getReadableVisibilities(actor) },
      },
      select: {
        visibility: true,
        organization: { select: { id: true, name: true, logo: true } },
      },
    });

  return memberships
    .map(({ organization, visibility }) => ({
      organization: {
        id: organization.id,
        name: organization.name,
        logo_url: getOrganizationLogoUrl(organization.logo),
      },
      visibility: toMembershipVisibility(visibility),
    }))
    .sort((first, second) =>
      first.organization.name.localeCompare(second.organization.name),
    );
};
