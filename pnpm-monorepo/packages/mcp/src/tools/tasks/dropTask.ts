import { dropTask, dropTaskInputSchema } from "@sam-monorepo/application";
import * as z from "zod";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  isTaskWriteToolVisible,
  taskOutputSchema,
} from "./taskOutputSchemas.js";

export const dropTaskTool = defineTool({
  name: "drop_task",
  group: ToolGroup.Tasks,
  title: "Drop a task",
  description:
    "Removes the assignment of the user from an open public task that the user accepted (task_id from list_tasks or get_task). Gives the task in the format of get_task, or null when the user cannot see the task anymore (a task that is hidden for other roles, when the user lost the required role).",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: dropTaskInputSchema,
  outputSchema: z.strictObject({
    task: taskOutputSchema.nullable(),
  }),
  isVisible: isTaskWriteToolVisible,
  handler: dropTask,
});
