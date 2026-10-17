import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { type CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findTaskListPage,
  TaskAcceptedFilter,
  TaskCreatorFilter,
  type TaskListItemRow,
  type TaskListRow,
  type TaskListStatus,
} from "@sam-monorepo/application";
import { cache } from "react";

/** The closed tasks increase each day, thus the list shows them in pages */
const CLOSED_TASKS_PAGE_SIZE = 20;

/**
 * Only the fields of `TASK_LIST_SELECT` go to the client component: the
 * description and the reward stay on the server
 */
const toTaskListRow = ({
  id,
  title,
  createdAt,
  completedAt,
  expiresAt,
  repeatable,
  cancelledAt,
  deletedAt,
  assignments,
  completionists,
}: TaskListItemRow): TaskListRow => ({
  id,
  title,
  createdAt,
  completedAt,
  expiresAt,
  repeatable,
  cancelledAt,
  deletedAt,
  assignments,
  completionists,
});

interface TasksPage {
  readonly tasks: TaskListRow[];
  /** The listed tasks which are new for the viewer */
  readonly newTaskIds: ReadonlySet<string>;
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
}

/**
 * The tasks list of the app: all open tasks on one page, the closed tasks
 * in pages (see `findTaskListPage`)
 */
export const getTasks = cache(
  withTrace(
    "getTasks",
    async (
      status: TaskListStatus,
      accepted: string,
      createdBy: string,
      cursor: string | null,
      direction: CursorDirection,
    ): Promise<TasksPage> => {
      try {
        const page = await findTaskListPage(
          getApplicationContext(),
          await getRequestActor(),
          {
            status,
            accepted:
              accepted === "yes"
                ? TaskAcceptedFilter.Yes
                : TaskAcceptedFilter.All,
            created_by:
              createdBy === "me" ? TaskCreatorFilter.Me : TaskCreatorFilter.All,
            limit: CLOSED_TASKS_PAGE_SIZE,
            cursor: cursor ?? undefined,
          },
          { direction, allOpenTasksOnOnePage: true },
        );

        return {
          tasks: page.rows.map(toTaskListRow),
          newTaskIds: page.newTaskIds,
          nextCursor: page.nextCursor,
          prevCursor: page.prevCursor,
        };
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
