import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import { requireCitizenReadAccess } from "./citizenAccess.js";
import {
  getVisiblePenaltyPointSum,
  getVisibleShipCount,
} from "./citizenMetrics.js";
import {
  listOrganizationMembershipsOfCitizen,
  type CitizenMembershipOutput,
} from "./organizationMemberships.js";
import { getVisibleAssignedRoleIds } from "./visibleRoles.js";

export const getCitizenInputSchema = z.object({
  citizen_id: z.cuid(),
});

/**
 * The values that only the Spynet shows. They are null (the list is empty)
 * without `citizen;read`.
 */
interface SpynetProfileValues {
  readonly spectrum_id: string | null;
  readonly community_moniker: string | null;
  /** The number of the UEE citizen record on the RSI website */
  readonly citizen_record: string | null;
  readonly created_at: string | null;
  /** Null also without `discord-id;read` */
  readonly discord_id: string | null;
  /** Null also without `teamspeak-id;read` */
  readonly teamspeak_id: string | null;
  /** Null also without `lastSeen;read` */
  readonly last_seen_at: string | null;
  /** Empty also without `organizationMembership;read` */
  readonly organization_memberships: CitizenMembershipOutput[];
}

export interface GetCitizenOutput extends SpynetProfileValues {
  readonly id: string;
  /** Display text. It can change and it does not identify the citizen. */
  readonly handle: string | null;
  /** IANA time zone name, for example "Europe/Berlin" */
  readonly timezone: string | null;
  /** The assigned roles that the actor can see, sorted by name */
  readonly roles: { readonly id: string; readonly name: string }[];
  /** The current penalty points, or null without the permission */
  readonly penalty_points: number | null;
  /** The number of ships, or null without the permission */
  readonly ship_count: number | null;
}

/**
 * The profile of a citizen with the values that the actor can read. Other
 * profiles need `citizen;read`. Without it, the actor reads the own profile
 * only with the values of the profile tile on the dashboard.
 */
export const getCitizen = async (
  context: ApplicationContext,
  actor: Actor,
  input: z.output<typeof getCitizenInputSchema>,
): Promise<GetCitizenOutput> => {
  requireCitizenReadAccess(actor, input.citizen_id);

  const canReadSpynetProfile = actor.authorize("citizen", "read");

  return withSpan(context, "getCitizen", async () => {
    const citizen = await context.prisma.citizen.findFirst({
      where: { id: input.citizen_id, ...ACTIVE_CITIZEN_WHERE },
      select: {
        id: true,
        handle: true,
        spectrumId: true,
        communityMoniker: true,
        citizenRecord: true,
        timezone: true,
        createdAt: true,
        discordId: true,
        teamspeakId: true,
        roleAssignments: { select: { roleId: true } },
        user: { select: { lastSeenAt: true } },
      },
    });
    if (!citizen) throw new NotFoundError("The citizen does not exist");

    const visibleRoleIds = getVisibleAssignedRoleIds(
      actor,
      citizen.roleAssignments,
    );

    const [roles, organizationMemberships, penaltyPoints, shipCount] =
      await Promise.all([
        context.prisma.role.findMany({
          where: { id: { in: visibleRoleIds } },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        canReadSpynetProfile &&
        actor.authorize("organizationMembership", "read")
          ? listOrganizationMembershipsOfCitizen(context, actor, citizen.id)
          : [],
        getVisiblePenaltyPointSum(context, actor, citizen.id),
        getVisibleShipCount(context, actor, citizen.id),
      ]);

    const spynetProfileValues: SpynetProfileValues = canReadSpynetProfile
      ? {
          spectrum_id: citizen.spectrumId,
          community_moniker: citizen.communityMoniker,
          citizen_record: citizen.citizenRecord,
          created_at: citizen.createdAt.toISOString(),
          discord_id: actor.authorize("discord-id", "read")
            ? citizen.discordId
            : null,
          teamspeak_id: actor.authorize("teamspeak-id", "read")
            ? citizen.teamspeakId
            : null,
          last_seen_at: actor.authorize("lastSeen", "read")
            ? (citizen.user?.lastSeenAt?.toISOString() ?? null)
            : null,
          organization_memberships: organizationMemberships,
        }
      : {
          spectrum_id: null,
          community_moniker: null,
          citizen_record: null,
          created_at: null,
          discord_id: null,
          teamspeak_id: null,
          last_seen_at: null,
          organization_memberships: [],
        };

    return {
      id: citizen.id,
      handle: citizen.handle,
      timezone: citizen.timezone,
      ...spynetProfileValues,
      roles,
      penalty_points: penaltyPoints,
      ship_count: shipCount,
    };
  });
};
