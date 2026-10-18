import { acceptTask, acceptTaskInputSchema } from "@sam-monorepo/application";
import { defineTool } from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import {
  isTaskWriteToolVisible,
  taskOutputSchema,
} from "./taskOutputSchemas.js";

export const acceptTaskTool = defineTool({
  name: "accept_task",
  group: ToolGroup.Tasks,
  title: "Accept a task",
  description:
    "Assigns the user to an open public task (task_id from list_tasks or get_task). The task must have a free place, and the user must have one of its required roles. A repeated call changes nothing. Gives the task in the format of get_task.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: acceptTaskInputSchema,
  outputSchema: taskOutputSchema,
  isVisible: isTaskWriteToolVisible,
  handler: acceptTask,
});
