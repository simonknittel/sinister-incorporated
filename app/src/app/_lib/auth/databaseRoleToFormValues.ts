import {
  type Permission,
  type PermissionAttribute,
  type Role,
} from "@prisma/client";
import { groupBy } from "lodash";
import { type DefaultValues } from "react-hook-form";
import { type FormValues } from "./FormValues";

export default function databaseRoleToFormValues(
  role: Role & {
    permissions: (Permission & { attributes: PermissionAttribute[] })[];
  },
) {
  const groupedByResource = groupBy(
    role.permissions,
    (permission) => permission.resource,
  );

  const defaultValues: DefaultValues<FormValues> = {
    note: [],
    otherRole: [],
  };

  for (const [resourceKey, permissions] of Object.entries(groupedByResource)) {
    if (["note", "otherRole"].includes(resourceKey)) {
      for (const permission of permissions) {
        const attributes = getAttributes(permission);

        defaultValues[resourceKey].push({
          operation: permission.operation,
          ...attributes,
        });
      }
    } else {
      defaultValues[resourceKey] = {};

      for (const permission of permissions) {
        if (permission.attributes.length <= 0) {
          defaultValues[resourceKey][permission.operation] = true;
          continue;
        }

        const attributes = getAttributes(permission);

        defaultValues[resourceKey][permission.operation] = attributes;
      }
    }
  }

  return defaultValues;
}

function getAttributes(
  permission: Permission & { attributes: PermissionAttribute[] },
) {
  const attributes = {};

  for (const attribute of permission.attributes) {
    attributes[attribute.key] =
      attribute.value === "true"
        ? true
        : attribute.value === "false"
        ? false
        : attribute.value;
  }

  return attributes;
}
