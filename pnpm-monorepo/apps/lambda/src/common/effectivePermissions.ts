import { loadEffectivePermissionsOfCitizens } from "@sam-monorepo/application";
import { prisma } from "@sam-monorepo/database";
import type { Prisma } from "@sam-monorepo/database/client";
import {
  comparePermissionSets,
  type PermissionSet,
} from "@sam-monorepo/domain";

/**
 * Effective role ids and permission sets per citizen, with the same rule as
 * the session of the app (see `loadEffectivePermissionsOfCitizens()`). The
 * result has only the citizens that match `where`, are not deleted and have
 * role assignments.
 */
export const loadEffectivePermissions = (where: Prisma.CitizenWhereInput) =>
  loadEffectivePermissionsOfCitizens({ prisma }, where);

/**
 * The effective permissions of the citizens that match `where`, are not
 * deleted and have each of the required permission sets through their
 * effective roles.
 */
export const findCitizensWithPermissions = async (
  where: Prisma.CitizenWhereInput,
  requiredPermissionSets: readonly PermissionSet[],
) => {
  const permissionsByCitizenId = await loadEffectivePermissions(where);

  return new Map(
    Array.from(permissionsByCitizenId).filter(([, { permissionSets }]) =>
      requiredPermissionSets.every((requiredPermissionSet) =>
        comparePermissionSets(requiredPermissionSet, permissionSets),
      ),
    ),
  );
};

/** The ids of the citizens of `findCitizensWithPermissions()` */
export const findCitizenIdsWithPermissions = async (
  where: Prisma.CitizenWhereInput,
  requiredPermissionSets: readonly PermissionSet[],
) =>
  new Set(
    (await findCitizensWithPermissions(where, requiredPermissionSets)).keys(),
  );
