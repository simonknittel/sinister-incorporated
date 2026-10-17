import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
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
    const { session } = await requireAuthentication();

    try {
      return await findVisibleTask(
        getApplicationContext(),
        await toActor(session),
        id,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
