import { updateTask, updateTaskInputSchema } from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { notifyingTaskWriteOutputSchema } from "./taskOutputSchemas.js";

export const updateTaskTool = defineTool({
  name: "update_task",
  group: ToolGroup.Tasks,
  title: "Update a task",
  description:
    "Changes the given fields of an open task (task_id from list_tasks or get_task); the fields that are not given stay. Only the creator of the task and a task manager can change it. assignee_ids replaces all citizens of the task, and a change of the assignees notifies them. Gives the task in the format of get_task.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: updateTaskInputSchema,
  outputSchema: notifyingTaskWriteOutputSchema,
  isVisible: (actor) => actor.authorize("task", "read"),
  handler: updateTask,
});
