import type { CatalogTool } from "../../toolDefinition.js";
import { getTaskTool } from "./getTask.js";
import { listTasksTool } from "./listTasks.js";

export const tasksTools: readonly CatalogTool[] = [getTaskTool, listTasksTool];
