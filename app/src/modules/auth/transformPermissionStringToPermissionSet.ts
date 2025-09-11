import type { PermissionSet } from "./common";

export const transformPermissionStringToPermissionSet = (
  permissionString: string,
) => {
  const [resource, operation, ...attributeStrings] =
    permissionString.split(";");

  if (!resource || !operation) throw new Error("Invalid permissionString");

  const permissionSet: PermissionSet = {
    resource,
    operation,
  };

  if (attributeStrings.length > 0) {
    permissionSet.attributes = attributeStrings.map((attributeString) => {
      const [key, value] = attributeString.split("=");
      if (!key || !value) throw new Error("Invalid attributeString");
      return { key, value };
    });
  }

  return permissionSet;
};
