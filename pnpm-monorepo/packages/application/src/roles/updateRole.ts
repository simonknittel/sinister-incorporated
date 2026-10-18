import {
  AuditEventType,
  ROLE_DESCRIPTION_MAX_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { RoleErrorMessage } from "./roleErrors.js";
import { ROLE_NAME_MAX_LENGTH } from "./roleInputSchemas.js";

/** About 27 years: far above a real period of inactivity */
const MAXIMUM_INACTIVITY_DAYS = 10_000;

/** The popover of a role badge shows one segment for each level */
const MAXIMUM_LEVEL = 100;

const inactivityDaysSchema = z.int().min(1).max(MAXIMUM_INACTIVITY_DAYS);

export const updateRoleInputSchema = z.object({
  role_id: idSchema,
  name: z.string().min(1).max(ROLE_NAME_MAX_LENGTH),
  description: z
    .string()
    .max(ROLE_DESCRIPTION_MAX_LENGTH)
    .nullish()
    .describe("Markdown. Null removes the description."),
  max_age_days: inactivityDaysSchema
    .nullish()
    .describe(
      "The number of days of inactivity after which a citizen loses the role. Null turns the removal off.",
    ),
  assign_after_inactive_days: inactivityDaysSchema
    .nullish()
    .describe(
      "The number of days of inactivity after which a citizen gets the role. Null turns the assignment off.",
    ),
  max_level: z
    .int()
    .min(1)
    .max(MAXIMUM_LEVEL)
    .nullish()
    .describe(
      "The number of levels that a citizen must reach to get the permissions of the role. Null removes the levels.",
    ),
});

export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;

export interface UpdateRoleOutput {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly max_age_days: number | null;
  readonly assign_after_inactive_days: number | null;
  readonly max_level: number | null;
}

/**
 * Changes the name, the description, the inactivity rules and the levels of
 * a role. Requires `role;manage`.
 *
 * @throws NotFoundError when the role does not exist
 */
export const updateRole = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateRoleInput,
): Promise<UpdateRoleOutput> =>
  withSpan(context, "updateRole", async () => {
    requirePermission(actor, "role", "manage");

    const existingRole = await context.prisma.role.findUnique({
      where: { id: input.role_id },
      select: {
        name: true,
        description: true,
        maxAgeDays: true,
        assignAfterInactiveDays: true,
      },
    });
    if (!existingRole) throw new NotFoundError(RoleErrorMessage.NotFound);

    const updatedRole = await context.prisma.role.update({
      where: { id: input.role_id },
      data: {
        name: input.name,
        description: input.description,
        maxAgeDays: input.max_age_days,
        assignAfterInactiveDays: input.assign_after_inactive_days,
        maxLevel: input.max_level,
      },
      select: {
        id: true,
        name: true,
        description: true,
        maxAgeDays: true,
        assignAfterInactiveDays: true,
        maxLevel: true,
      },
    });

    await context.audit.create([
      {
        type: AuditEventType.ROLE_UPDATED_V3,
        data: {
          roleId: updatedRole.id,
          previousName: existingRole.name,
          newName: updatedRole.name,
          previousMaxAgeDays: existingRole.maxAgeDays,
          newMaxAgeDays: updatedRole.maxAgeDays,
          previousAssignAfterInactiveDays: existingRole.assignAfterInactiveDays,
          newAssignAfterInactiveDays: updatedRole.assignAfterInactiveDays,
          previousDescription: existingRole.description,
          newDescription: updatedRole.description,
        },
        createdById: actor.userId,
      },
    ]);

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      max_age_days: updatedRole.maxAgeDays,
      assign_after_inactive_days: updatedRole.assignAfterInactiveDays,
      max_level: updatedRole.maxLevel,
    };
  });
