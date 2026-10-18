import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { RoleErrorMessage } from "./roleErrors.js";
import { MAXIMUM_ROLE_RELATIONS } from "./roleInputSchemas.js";
import { updateExistingRole } from "./roleUpdates.js";

export const updateRoleInheritanceInputSchema = z.object({
  role_id: idSchema,
  inherited_role_ids: z
    .array(idSchema)
    .max(MAXIMUM_ROLE_RELATIONS)
    .describe(
      "All roles whose permissions the role gives after the change. The list replaces the inherited roles.",
    ),
});

export type UpdateRoleInheritanceInput = z.infer<
  typeof updateRoleInheritanceInputSchema
>;

export interface UpdateRoleInheritanceOutput {
  readonly id: string;
  readonly inherited_role_ids: string[];
}

/**
 * Replaces the roles that a role inherits. Requires `role;manage`.
 *
 * @throws ValidationError when the role inherits itself
 * @throws NotFoundError when the role or an inherited role does not exist
 */
export const updateRoleInheritance = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateRoleInheritanceInput,
): Promise<UpdateRoleInheritanceOutput> =>
  withSpan(context, "updateRoleInheritance", async () => {
    requirePermission(actor, "role", "manage");

    /**
     * The form leaves the role out of its own list, and the database
     * rejects the row either way
     */
    if (input.inherited_role_ids.includes(input.role_id))
      throw new ValidationError(RoleErrorMessage.SelfInheritance);

    const role = await updateExistingRole(() =>
      context.prisma.role.update({
        where: { id: input.role_id },
        data: {
          inherits: {
            set: input.inherited_role_ids.map((id) => ({ id })),
          },
        },
        select: { id: true, inherits: { select: { id: true } } },
      }),
    );

    await context.audit.create([
      {
        type: AuditEventType.ROLE_INHERITANCE_UPDATED,
        data: { roleId: role.id },
        createdById: actor.userId,
      },
    ]);

    return {
      id: role.id,
      inherited_role_ids: role.inherits.map(
        (inheritedRole) => inheritedRole.id,
      ),
    };
  });
