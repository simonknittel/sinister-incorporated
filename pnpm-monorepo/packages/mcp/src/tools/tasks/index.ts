import type { CatalogTool } from "../../toolDefinition.js";
import { acceptTaskTool } from "./acceptTask.js";
import { cancelTaskTool } from "./cancelTask.js";
import { completeTaskTool } from "./completeTask.js";
import { createTaskTool } from "./createTask.js";
import { dropTaskTool } from "./dropTask.js";
import { getTaskTool } from "./getTask.js";
import { listTasksTool } from "./listTasks.js";
import { updateTaskTool } from "./updateTask.js";

export const tasksTools: readonly CatalogTool[] = [
  acceptTaskTool,
  cancelTaskTool,
  completeTaskTool,
  createTaskTool,
  dropTaskTool,
  getTaskTool,
  listTasksTool,
  updateTaskTool,
];
