import { getTask, getTaskInputSchema } from "@sam-monorepo/application";
import * as z from "zod";
import { citizenReferenceSchema } from "../../schemas.js";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { taskListItemOutputShape } from "./taskOutputSchemas.js";

export const getTaskTool = defineTool({
  name: "get_task",
  group: ToolGroup.Tasks,
  title: "Get a task",
  description:
    "Gives one task with its details: the fields of list_tasks, the completionists, the required roles that the user can see, whether the user has a required role, whether the user can manage the task, whether the task is still open for changes, the repetitions and the assignment limit.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: getTaskInputSchema,
  outputSchema: z.strictObject({
    ...taskListItemOutputShape,
    completionists: z.array(citizenReferenceSchema),
    required_roles: z.array(
      z.strictObject({
        id: z.string(),
        name: z.string(),
      }),
    ),
    has_required_role: z.boolean(),
    can_manage: z.boolean(),
    is_updatable: z.boolean(),
    repeatable: z.number().int(),
    hidden_for_other_roles: z.boolean(),
    assignment_limit: z.number().int().nullable(),
  }),
  isVisible: (actor) =>
    actor.authorize("task", "read") && actor.citizen !== null,
  handler: (context, actor, input) => getTask(context, actor, input),
});
