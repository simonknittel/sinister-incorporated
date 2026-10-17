import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findVisibleTask } from "@sam-monorepo/application";
import type { Task } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * The task with the relations of the task page, or null when the viewer
 * cannot see it. The task actions use the same row.
 */
export const getTaskById = cache(
  withTrace("getTaskById", async (id: Task["id"]) => {
    try {
      return await findVisibleTask(
        getApplicationContext(),
        await getRequestActor(),
        id,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
