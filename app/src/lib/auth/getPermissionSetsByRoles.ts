import { type PermissionString, type Role } from "@prisma/client";
import { type PermissionSet } from "./PermissionSet";

type Roles = Array<
  Role & {
    permissionStrings: Array<PermissionString>;
  }
>;

export default function getPermissionSetsByRoles(
  roles: Roles,
): PermissionSet[] {
  const permissionSets = [];

  for (const role of roles) {
    for (const permissionString of role.permissionStrings) {
      const [resource, operation, ...attributeStrings] =
        permissionString.permissionString.split(";");

      if (!resource || !operation) throw new Error("Invalid permissionString");

      const permissionSet: PermissionSet = {
        resource,
        operation,
      };

      if (attributeStrings.length > 0)
        permissionSet.attributes = attributeStrings.map((attributeString) => {
          const [key, value] = attributeString.split("=");

          if (!key || !value) throw new Error("Invalid attributeString string");

          return { key, value };
        });

      permissionSets.push(permissionSet);
    }
  }

  return permissionSets;
}
