import type { Prisma } from "@sam-monorepo/database/client";
import {
  ACTIVE_CITIZEN_WHERE,
  EFFECTIVE_ROLE_PERMISSIONS_SELECT,
  getPermissionSetsByRoles,
  resolveEffectiveRoles,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import type { EffectiveRoles } from "./getEffectiveRolesOfCitizen.js";

/**
 * Effective role ids and permission sets per citizen, with the same rule as
 * the session of the app: the level gate and the inherited roles (see
 * `resolveEffectiveRoles()`). The result has only the citizens that match
 * `where`, are not deleted and have role assignments. No permission check:
 * the automations and the notification router use it to find the receivers.
 */
export const loadEffectivePermissionsOfCitizens = async (
  context: Pick<ApplicationContext, "prisma">,
  where: Prisma.CitizenWhereInput,
): Promise<Map<string, Pick<EffectiveRoles, "roleIds" | "permissionSets">>> => {
  const assignments = await context.prisma.roleAssignment.findMany({
    where: { citizen: { AND: [where, ACTIVE_CITIZEN_WHERE] } },
    select: { citizenId: true, ...EFFECTIVE_ROLE_PERMISSIONS_SELECT },
  });

  const assignmentsByCitizenId = Map.groupBy(
    assignments,
    (assignment) => assignment.citizenId,
  );

  return new Map(
    Array.from(assignmentsByCitizenId, ([citizenId, citizenAssignments]) => {
      const effectiveRoles = resolveEffectiveRoles(citizenAssignments);

      return [
        citizenId,
        {
          roleIds: new Set(effectiveRoles.map((role) => role.id)),
          permissionSets: getPermissionSetsByRoles(effectiveRoles),
        },
      ];
    }),
  );
};
