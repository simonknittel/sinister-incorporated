import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findNewTaskRows } from "@sam-monorepo/application";
import { cache } from "react";

/** Keeps the tile short; the tasks list shows all new tasks */
const MAX_TASKS = 5;

/**
 * The newest tasks which are new for the viewer, for the "Neue Tasks" tile.
 * Tasks assigned to the viewer are left out: the "Meine Tasks" tile already
 * shows them.
 */
export const getNewTasksForDashboard = cache(
  withTrace("getNewTasksForDashboard", async () => {
    try {
      return await findNewTaskRows(
        getApplicationContext(),
        await getRequestActor(),
        { limit: MAX_TASKS },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
