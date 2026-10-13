import { prisma } from "@/db";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import type { Citizen } from "@sam-monorepo/database/client";
import {
  ACTIVE_CITIZEN_WHERE,
  EFFECTIVE_ROLE_PERMISSIONS_SELECT,
} from "@sam-monorepo/domain";
import {
  comparePermissionSets,
  getPermissionSetsByRoles,
  resolveEffectiveRoles,
} from "@sam-monorepo/permissions";
import { cache } from "react";
import { getHumanResourcesRoleIds } from "./getHumanResourcesRoleIds";

export interface HumanResourcesContact {
  readonly id: Citizen["id"];
  readonly handle: string;
}

/**
 * The citizens that a new user can contact for the clearance, sorted by
 * handle. A citizen without a handle cannot be named, thus is not listed.
 * A citizen is a contact if the citizen is active, has one of the
 * Human Resources roles among the effective roles (the level gate applies,
 * inherited roles count) and can log in (`login;manage` without
 * `login;negate`). This is the same rule as the session callback.
 *
 * The where-fragment only makes the scan smaller and matches a superset,
 * because Prisma cannot compare `currentLevel` with `Role.maxLevel`. The
 * rule is applied in memory. No permission check: the clearance page calls
 * it for a user without permissions.
 */
export const getHumanResourcesContacts = cache(
  withTrace(
    "getHumanResourcesContacts",
    async (): Promise<HumanResourcesContact[]> => {
      const roleIds = await getHumanResourcesRoleIds();
      if (roleIds.length === 0) return [];

      const candidates = await prisma.citizen.findMany({
        where: {
          ...ACTIVE_CITIZEN_WHERE,
          handle: { not: null },
          roleAssignments: {
            some: {
              role: {
                OR: [
                  { id: { in: roleIds } },
                  { inherits: { some: { id: { in: roleIds } } } },
                ],
              },
            },
          },
        },
        orderBy: { handle: "asc" },
        select: {
          id: true,
          handle: true,
          roleAssignments: { select: EFFECTIVE_ROLE_PERMISSIONS_SELECT },
        },
      });

      const humanResourcesRoleIds = new Set(roleIds);

      return candidates
        .filter((candidate) => {
          const effectiveRoles = resolveEffectiveRoles(
            candidate.roleAssignments,
          );

          return (
            effectiveRoles.some((role) => humanResourcesRoleIds.has(role.id)) &&
            comparePermissionSets(
              { resource: "login", operation: "manage" },
              getPermissionSetsByRoles(effectiveRoles),
            )
          );
        })
        .flatMap(({ id, handle }) => (handle ? [{ id, handle }] : []));
    },
  ),
);
