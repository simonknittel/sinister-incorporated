import { type Role } from "@prisma/client";
import { type z } from "zod";
import { prisma } from "../../server/db";
import { type PermissionSet } from "./PermissionSet";
import type postBodySchema from "./postBodySchema";

export default function formValuesToPrismaOperations(
  roleId: Role["id"],
  data: z.infer<typeof postBodySchema>,
) {
  return Object.entries(data).flatMap(([resourceKey, resourceValue]) => {
    if (Array.isArray(resourceValue)) {
      return createPermissionsFromRules(roleId, resourceKey, resourceValue);
    } else {
      return createGenericPermissions(roleId, resourceKey, resourceValue);
    }
  });
}

function createGenericPermissions(
  roleId: Role["id"],
  resourceKey: PermissionSet["resource"],
  resourceValue,
) {
  return Object.entries(resourceValue)
    .filter(([_operationKey, operationValue]) => {
      // We don't want to create permissions whose operations are false attributes only have empty arrays
      if (typeof operationValue === "boolean" && operationValue === false)
        return false;

      return true;
    })
    .map(([operationKey, operationValue]) =>
      createPermission(roleId, resourceKey, operationKey, operationValue),
    );
}

function createPermissionsFromRules(
  roleId: Role["id"],
  resourceKey: PermissionSet["resource"],
  rules: Record<"operation" | string, string>,
) {
  return rules.map((rule) => {
    const { operation, ...attributes } = rule;
    return createPermission(roleId, resourceKey, operation, attributes);
  });
}

function createPermission(
  roleId: Role["id"],
  resourceKey: PermissionSet["resource"],
  operationKey: PermissionSet["operation"],
  valueOrAttributes: boolean | Record<string, string | boolean>,
) {
  return prisma.permission.create({
    data: {
      roleId,
      resource: resourceKey,
      operation: operationKey,
      attributes:
        typeof valueOrAttributes === "boolean"
          ? undefined
          : {
              create: Object.entries(valueOrAttributes)
                .filter(([_operationKey, operationValue]) => {
                  // We don't want to create permissions whose operations are false attributes only have empty arrays
                  if (
                    typeof operationValue === "boolean" &&
                    operationValue === false
                  )
                    return false;

                  return true;
                })
                .map(([attributeKey, attributeValue]) => ({
                  key: attributeKey,
                  value: String(attributeValue),
                })),
            },
    },
  });
}
