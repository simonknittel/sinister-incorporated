import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import {
  ROLE_OUTPUT_SELECT,
  toRoleOutput,
  type RoleOutput,
} from "./roleOutput.js";
import { isRoleVisible } from "./roleVisibility.js";

export const getRoleInputSchema = z.object({
  role_id: idSchema,
});

export type GetRoleInput = z.output<typeof getRoleInputSchema>;

export interface GetRoleOutput extends RoleOutput {
  /**
   * The number of days of inactivity after which a citizen loses the role,
   * or null
   */
  readonly max_age_days: number | null;
  /**
   * The number of days of inactivity after which a citizen gets the role, or
   * null
   */
  readonly assign_after_inactive_days: number | null;
  /** Sorted. Null without `role;manage`. */
  readonly permission_strings: string[] | null;
}

/**
 * One role that the actor can see (see `isRoleVisible()`), with its
 * permission strings for an actor with `role;manage`
 *
 * @throws NotFoundError when the role does not exist or the actor cannot see
 * it
 */
export const getRole = async (
  context: ApplicationContext,
  actor: Actor,
  input: GetRoleInput,
): Promise<GetRoleOutput> => {
  if (!isRoleVisible(actor, input.role_id))
    throw new NotFoundError("The role does not exist");

  const role = await context.prisma.role.findUnique({
    where: { id: input.role_id },
    select: {
      ...ROLE_OUTPUT_SELECT,
      maxAgeDays: true,
      assignAfterInactiveDays: true,
      permissionStrings: {
        select: { permissionString: true },
        orderBy: { permissionString: "asc" },
      },
    },
  });
  if (!role) throw new NotFoundError("The role does not exist");

  return {
    ...toRoleOutput(context, actor, role),
    max_age_days: role.maxAgeDays,
    assign_after_inactive_days: role.assignAfterInactiveDays,
    permission_strings: actor.authorize("role", "manage")
      ? role.permissionStrings.map(
          (permissionString) => permissionString.permissionString,
        )
      : null,
  };
};
