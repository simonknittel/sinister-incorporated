import { TaskRewardType, TaskVisibility } from "@sam-monorepo/database/browser";
import {
  ACTIVE_CITIZEN_WHERE,
  MAX_SILC_VALUE,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_MAX_CITIZENS,
  TASK_MAX_REQUIRED_ROLES,
  TASK_REWARD_TEXT_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  DATE_TIME_INPUT_DESCRIPTION,
  dateTimeInputSchema,
} from "../dateTime.js";
import { ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { isRoleVisible } from "../roles/roleVisibility.js";
import { TaskErrorMessage } from "./taskErrors.js";
import { TaskRewardKind, TaskVisibilityKind } from "./taskOutput.js";

/** The schemas of the task fields that the create and the update share */
export const taskFieldSchemas = {
  title: z.string().trim().min(1).max(TASK_TITLE_MAX_LENGTH),
  description: z
    .string()
    .trim()
    .max(TASK_DESCRIPTION_MAX_LENGTH)
    .describe("Markdown."),
  expires_at: dateTimeInputSchema.describe(
    `When the task expires. ${DATE_TIME_INPUT_DESCRIPTION}`,
  ),
  // The database column is a 32-bit integer
  repeatable: z
    .int32()
    .min(1)
    .describe(
      "How often the task can be completed. Each completion creates the next repetition with the rest of the count.",
    ),
  reward_silc_value: z
    .int32()
    .min(1)
    .max(MAX_SILC_VALUE)
    .describe("The SILC for each completionist."),
  reward_text: z
    .string()
    .trim()
    .max(TASK_REWARD_TEXT_MAX_LENGTH)
    .describe("The reward as a Markdown text."),
  required_role_ids: z
    .array(idSchema)
    .max(TASK_MAX_REQUIRED_ROLES)
    .describe(
      "The roles of which a citizen must have one to accept a public task, from list_roles.",
    ),
  hidden_for_other_roles: z
    .boolean()
    .describe(
      "Whether only the citizens with a required role can see the public task.",
    ),
  assignment_limit: z
    .int32()
    .min(1)
    .nullable()
    .describe(
      "The maximum number of citizens that can accept the public task, or null for no limit.",
    ),
  assignee_ids: z.array(idSchema).max(TASK_MAX_CITIZENS),
};

export const TASK_VISIBILITY_BY_KIND: Readonly<
  Record<TaskVisibilityKind, TaskVisibility>
> = {
  [TaskVisibilityKind.Public]: TaskVisibility.PUBLIC,
  [TaskVisibilityKind.Personalized]: TaskVisibility.PERSONALIZED,
  [TaskVisibilityKind.Group]: TaskVisibility.GROUP,
};

export const TASK_REWARD_TYPE_BY_KIND: Readonly<
  Record<TaskRewardKind, TaskRewardType>
> = {
  [TaskRewardKind.Silc]: TaskRewardType.SILC,
  [TaskRewardKind.NewSilc]: TaskRewardType.NEW_SILC,
  [TaskRewardKind.Text]: TaskRewardType.TEXT,
};

/**
 * The assignees that a write adds must be citizens that are not deleted,
 * like the choices of the citizen picker of the forms
 *
 * @param citizenIds The citizens that the write adds
 * @throws ValidationError when a citizen does not exist or is deleted
 */
export const requireActiveAssignees = async (
  context: ApplicationContext,
  citizenIds: readonly string[],
) => {
  const uniqueCitizenIds = [...new Set(citizenIds)];
  if (uniqueCitizenIds.length <= 0) return;

  const activeCount = await context.prisma.citizen.count({
    where: { id: { in: uniqueCitizenIds }, ...ACTIVE_CITIZEN_WHERE },
  });
  if (activeCount !== uniqueCitizenIds.length)
    throw new ValidationError(TaskErrorMessage.UnknownAssignee);
};

/**
 * The required roles that a write adds must exist and be visible for the
 * actor, like the choices of the role picker of the forms
 *
 * @param roleIds The roles that the write adds
 * @throws ValidationError when a role does not exist or is not visible
 */
export const requireVisibleRoles = async (
  context: ApplicationContext,
  actor: Actor,
  roleIds: readonly string[],
) => {
  const uniqueRoleIds = [...new Set(roleIds)];
  if (uniqueRoleIds.length <= 0) return;

  if (uniqueRoleIds.some((roleId) => !isRoleVisible(actor, roleId)))
    throw new ValidationError(TaskErrorMessage.UnknownRequiredRole);

  const existingCount = await context.prisma.role.count({
    where: { id: { in: uniqueRoleIds } },
  });
  if (existingCount !== uniqueRoleIds.length)
    throw new ValidationError(TaskErrorMessage.UnknownRequiredRole);
};
