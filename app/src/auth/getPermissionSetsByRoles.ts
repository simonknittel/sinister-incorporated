import { type PermissionString, type Role } from "@prisma/client";
import { type PermissionSet } from "./PermissionSet";
import { transformPermissionStringToPermissionSet } from "./transformPermissionStringToPermissionSet";

type Roles = (Role & {
  permissionStrings: PermissionString[];
})[];

export const getPermissionSetsByRoles = (roles: Roles): PermissionSet[] => {
  const permissionSets = [];

  for (const role of roles) {
    for (const permissionString of role.permissionStrings) {
      const permissionSet = transformPermissionStringToPermissionSet(
        permissionString.permissionString,
      );
      permissionSets.push(permissionSet);
    }
  }

  return permissionSets;
};
