import {
  TaskRewardKind,
  TaskStatus,
  TaskVisibilityKind,
} from "@sam-monorepo/application";
import * as z from "zod";
import { citizenReferenceSchema, dateTimeOutputSchema } from "../../schemas.js";

/** The fields of a task in `list_tasks`, and the base of `get_task` */
export const taskListItemOutputShape = {
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().describe("Markdown."),
  status: z.enum(TaskStatus),
  created_at: dateTimeOutputSchema,
  expires_at: dateTimeOutputSchema.nullable(),
  created_by: citizenReferenceSchema.nullable(),
  assignees: z.array(citizenReferenceSchema),
  reward: z.strictObject({
    type: z.enum(TaskRewardKind),
    value: z
      .union([z.number().int(), z.string()])
      .nullable()
      .describe(
        "The SILC for each completionist, or the Markdown text of a text reward.",
      ),
  }),
  visibility: z.enum(TaskVisibilityKind),
  is_assigned_to_me: z.boolean(),
  is_new: z.boolean(),
};
