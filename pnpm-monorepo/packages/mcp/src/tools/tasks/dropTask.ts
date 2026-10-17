import { dropTask, dropTaskInputSchema } from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { taskWriteOutputSchema } from "./taskOutputSchemas.js";

export const dropTaskTool = defineTool({
  name: "drop_task",
  group: ToolGroup.Tasks,
  title: "Drop a task",
  description:
    "Removes the assignment of the user from an open public task that the user accepted (task_id from list_tasks or get_task). Gives the task in the format of get_task.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: dropTaskInputSchema,
  outputSchema: taskWriteOutputSchema,
  isVisible: (actor) => actor.authorize("task", "read"),
  handler: dropTask,
});
