import { TaskRewardType, TaskVisibility } from "@sam-monorepo/database/browser";
import * as z from "zod";
import { idSchema } from "../pagination.js";
import { MAX_SILC_VALUE } from "./silcLedger.js";
import { TaskRewardKind, TaskVisibilityKind } from "./taskOutput.js";

/**
 * Arbitrary (untested) cap so a hostile client cannot store an unbounded
 * description. The description fields of the task forms of the app have the
 * same limit.
 */
export const TASK_DESCRIPTION_MAX_LENGTH = 2048;

/** The schemas of the task fields that the create and the update share */
export const taskFieldSchemas = {
  title: z.string().trim().max(64),
  description: z
    .string()
    .trim()
    .max(TASK_DESCRIPTION_MAX_LENGTH)
    .describe("Markdown."),
  expires_at: z.iso
    .datetime({ offset: true })
    .describe(
      "When the task expires: ISO 8601 with a time zone offset, for example 2026-12-31T23:59:00+01:00.",
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
  /** Arbitrary (untested) limit of the size of the text */
  reward_text: z
    .string()
    .trim()
    .max(2048)
    .describe("The reward as a Markdown text."),
  /** Arbitrary (untested) limit to prevent a denial of service */
  required_role_ids: z
    .array(idSchema)
    .max(50)
    .describe(
      "The roles of which a citizen must have one to accept a public task, for example from list_roles.",
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
      "The maximum number of citizens that can accept the task, or null for no limit.",
    ),
  /** Arbitrary (untested) limit to prevent a denial of service */
  assignee_ids: z.array(idSchema).max(250),
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
