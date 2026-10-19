import { loadEffectivePermissionsOfCitizens } from "@sam-monorepo/application";
import { prisma } from "@sam-monorepo/database";
import type { Prisma } from "@sam-monorepo/database/client";
import {
  comparePermissionSets,
  type PermissionSet,
} from "@sam-monorepo/domain";

/**
 * The effective permissions of the citizens that match `where`, are not
 * deleted and have each of the required permission sets through their
 * effective roles. The effective roles follow the rule of the session of the
 * app (see `loadEffectivePermissionsOfCitizens()`).
 */
export const findCitizensWithPermissions = async (
  where: Prisma.CitizenWhereInput,
  requiredPermissionSets: readonly PermissionSet[],
) => {
  const permissionsByCitizenId = await loadEffectivePermissionsOfCitizens(
    { prisma },
    where,
  );

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
