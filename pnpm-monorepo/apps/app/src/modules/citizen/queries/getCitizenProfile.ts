import { prisma } from "@/db";
import { getApplicationContext, getRequestActor } from "@/modules/application";
import { getAssignableRoles } from "@/modules/roles/utils/getRoles";
import { getMonthlySalaryOfRoles } from "@/modules/silc/queries/getMonthlySalaryOfRoles";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  getVisiblePenaltyPointSum,
  getVisibleShipCount,
  requireCitizenReadAccess,
} from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { cache } from "react";
import { hasBirthdayToday } from "../utils/hasBirthdayToday";

/**
 * Everything both profile surfaces show: the citizen popover and the profile
 * tile of the dashboard. The metrics are per-metric optional — a metric the
 * viewer must not see is `null` instead of a number, so that the surfaces do
 * not show a zero which is only a missing permission.
 *
 * The permission for each metric depends on whether the viewer looks at
 * their own citizen or at a different one. Reading the own profile needs no
 * `citizen;read`, because the dashboard tile shows it to every citizen.
 *
 * A metric also carries the Spynet page behind it, but only when the viewer
 * can open that page. Each of these pages asks for its own permission, which
 * is not always the one that shows the metric — a link the viewer cannot
 * follow is worse than no link.
 */
export const getCitizenProfile = cache(
  withTrace("getCitizenProfile", async (id: Citizen["id"]) => {
    const actor = await getRequestActor();
    requireCitizenReadAccess(actor, id);

    const isCurrentCitizen = actor.citizen?.id === id;
    const canOpenSpynet = actor.authorize("citizen", "read");

    const citizen = await prisma.citizen.findFirst({
      where: {
        id,
        ...ACTIVE_CITIZEN_WHERE,
      },
      select: {
        id: true,
        handle: true,
        silcBalance: true,
        timezone: true,
        /** Read for the party hat below; only the answer leaves the server */
        birthdayDay: true,
        birthdayMonth: true,
        roleAssignments: {
          select: {
            roleId: true,
            currentLevel: true,
          },
        },
        /**
         * The avatar of a citizen is the Discord avatar of its login, which
         * the app refreshes at every sign-in
         */
        user: {
          select: {
            image: true,
          },
        },
      },
    });

    if (!citizen) return null;

    const canReadSilcBalance = actor.authorize(
      isCurrentCitizen
        ? "silcBalanceOfCurrentCitizen"
        : "silcBalanceOfOtherCitizen",
      "read",
    );
    const canOpenSilcPage = actor.authorize(
      isCurrentCitizen
        ? "silcTransactionOfCurrentCitizen"
        : "silcTransactionOfOtherCitizen",
      "read",
    );
    /** The fleet page asks for `otherShips;read`, also for the own fleet */
    const canOpenFleetPage = actor.authorize("otherShips", "read");

    const context = getApplicationContext();
    const [assignableRoles, monthlySalary, penaltyPoints, fleetCount] =
      await Promise.all([
        getAssignableRoles(),
        canReadSilcBalance
          ? getMonthlySalaryOfRoles(citizen.roleAssignments)
          : null,
        getVisiblePenaltyPointSum(context, actor, citizen.id),
        getVisibleShipCount(context, actor, citizen.id),
      ]);

    const spynetHref = `/app/spynet/citizen/${citizen.id}`;
    const buildMetricHref = (canOpenPage: boolean, subPage: string) =>
      canOpenSpynet && canOpenPage ? `${spynetHref}/${subPage}` : null;

    return {
      citizen: {
        id: citizen.id,
        handle: citizen.handle,
        timezone: citizen.timezone,
        hasBirthdayToday: hasBirthdayToday(citizen, new Date()),
        roleAssignments: citizen.roleAssignments,
      },
      avatarUrl: citizen.user?.image ?? null,
      isCurrentCitizen,
      spynetHref: canOpenSpynet ? spynetHref : null,
      canUpdateAnyRoleAssignment: assignableRoles.length > 0,
      metrics: {
        silc: canReadSilcBalance
          ? {
              balance: citizen.silcBalance,
              monthlySalary: monthlySalary ?? 0,
              href: buildMetricHref(canOpenSilcPage, "silc"),
            }
          : null,
        penaltyPoints:
          penaltyPoints === null
            ? null
            : {
                value: penaltyPoints,
                /**
                 * The penalty points page asks for the same permission as
                 * the metric
                 */
                href: buildMetricHref(true, "penalty-points"),
              },
        fleet:
          fleetCount === null
            ? null
            : {
                count: fleetCount,
                href: buildMetricHref(canOpenFleetPage, "fleet"),
              },
      },
    };
  }),
);

export type CitizenProfile = NonNullable<
  Awaited<ReturnType<typeof getCitizenProfile>>
>;
