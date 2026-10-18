import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  MAXIMUM_ROLE_RELATIONS,
  permissionStringSchema,
} from "./roleInputSchemas.js";
import { updateExistingRole } from "./roleUpdates.js";

export const updateRolePermissionsInputSchema = z.object({
  role_id: idSchema,
  permission_strings: z
    .array(permissionStringSchema)
    .max(MAXIMUM_ROLE_RELATIONS)
    .describe(
      "All permission strings of the role after the change. The list replaces the permission strings.",
    ),
});

export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsInputSchema
>;

export interface UpdateRolePermissionsOutput {
  readonly id: string;
  /** Sorted */
  readonly permission_strings: string[];
}

/**
 * Replaces the permission strings of a role. Requires `role;manage`.
 *
 * @throws NotFoundError when the role does not exist
 */
export const updateRolePermissions = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateRolePermissionsInput,
): Promise<UpdateRolePermissionsOutput> =>
  withSpan(context, "updateRolePermissions", async () => {
    requirePermission(actor, "role", "manage");

    const role = await updateExistingRole(() =>
      context.prisma.role.update({
        where: { id: input.role_id },
        data: {
          permissionStrings: {
            deleteMany: {},
            createMany: {
              data: input.permission_strings.map((permissionString) => ({
                permissionString,
              })),
              skipDuplicates: true,
            },
          },
        },
        select: {
          id: true,
          permissionStrings: {
            select: { permissionString: true },
            orderBy: { permissionString: "asc" },
          },
        },
      }),
    );

    await context.audit.create([
      {
        type: AuditEventType.ROLE_PERMISSIONS_UPDATED,
        data: { roleId: role.id },
        createdById: actor.userId,
      },
    ]);

    return {
      id: role.id,
      permission_strings: role.permissionStrings.map(
        (permissionString) => permissionString.permissionString,
      ),
    };
  });
