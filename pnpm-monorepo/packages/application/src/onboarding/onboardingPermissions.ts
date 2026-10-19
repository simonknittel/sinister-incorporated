import { transformPermissionStringToPermissionSet } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";

/**
 * Whether the actor satisfies at least one of the permission strings. An
 * absent or empty list means that no permission is required.
 */
export const satisfiesAnyPermissionString = (
  actor: Actor,
  permissionStrings: readonly string[] | undefined,
): boolean => {
  if (!permissionStrings || permissionStrings.length === 0) return true;

  return permissionStrings.some((permissionString) => {
    const permissionSet =
      transformPermissionStringToPermissionSet(permissionString);

    return actor.authorize(
      permissionSet.resource,
      permissionSet.operation,
      permissionSet.attributes,
    );
  });
};
