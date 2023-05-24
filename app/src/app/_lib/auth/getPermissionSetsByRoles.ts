import {
  type Permission,
  type PermissionAttribute,
  type Role,
} from "@prisma/client";
import { type PermissionSet } from "./PermissionSet";

type Roles = (Role & {
  permissions: (Permission & {
    attributes: PermissionAttribute[];
  })[];
})[];

export default function getPermissionSetsByRoles(
  roles: Roles
): PermissionSet[] {
  const permissionSets = [];

  for (const role of roles) {
    for (const permission of role.permissions) {
      const permissionSet = {
        resource: permission.resource,
        operation: permission.operation,
        ...(permission.attributes.length > 0
          ? {
              attributes: permission.attributes.map((attribute) => ({
                key: attribute.key,
                value: attribute.value,
              })),
            }
          : {}),
      };

      permissionSets.push(permissionSet);
    }
  }

  return permissionSets;
}
