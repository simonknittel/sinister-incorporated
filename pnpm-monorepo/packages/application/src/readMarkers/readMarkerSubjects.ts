import type { Prisma } from "@sam-monorepo/database/client";
import { ReadMarkerSubject, type PermissionSet } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  buildVisibleEventsWhere,
  toEventViewer,
} from "../events/eventVisibility.js";
import { findNewEventIds, getOpenEventsWhere } from "../events/openEvents.js";
import { findNewTaskIds } from "../tasks/findNewTaskIds.js";
import { getOpenTasksWhere, getVisibleTasksWhere } from "../tasks/taskWhere.js";
import type { UnreadWhere } from "./unreadWhere.js";

interface ReadMarkerSubjectRule {
  /** The resource of the permission to read the items at all */
  readonly readResource: PermissionSet["resource"];
  /** The marker column which points at the item */
  readonly markerData: (
    subjectId: string,
  ) => Omit<
    Prisma.ReadMarkerUncheckedCreateInput,
    "id" | "citizenId" | "readAt"
  >;
  /** Whether the item exists and the actor can see it */
  readonly canRead: (
    context: ApplicationContext,
    actor: Actor,
    subjectId: string,
  ) => Promise<boolean>;
  /**
   * Of the given items, the ones which are new. The visibility is not
   * checked again: the ids come from queries which already applied it.
   */
  readonly findNewIds: (
    context: ApplicationContext,
    subjectIds: readonly string[],
    unreadWhere: UnreadWhere,
  ) => Promise<string[]>;
  /** How many of the items which the actor can see are new */
  readonly countNew: (
    context: ApplicationContext,
    actor: Actor,
    unreadWhere: UnreadWhere,
  ) => Promise<number>;
}

/**
 * Everything the generic read markers need to know about a subject type. An
 * item is new when it is "open" in the sense of its subject and matches
 * `UnreadWhere`.
 *
 * To add a subject type:
 * 1. In the database: see the comment of the `ReadMarker` model.
 * 2. Add a value to the `ReadMarkerSubject` enum of the domain package.
 * 3. Add its start of the tracking to `READ_MARKER_TRACKED_SINCE` in
 *    `unreadWhere.ts`.
 * 4. Add a rule here. The subject model must have `createdAt`,
 *    `createdById` and the relation `readMarkers`, thus `UnreadWhere` fits
 *    it. Add the app slug of its dot badge to `READ_MARKER_APP_SLUGS` in the
 *    app; subjects of one app share its dot badge, and the counts add up.
 * 5. In the lists: get the new items of each page with `getNewIds()` of the
 *    app, and show them with `useMarkAsRead()`, `<UnreadEdge>` and
 *    `<NewMarkerButton>`.
 * 6. On the details: add `<MarkAsReadOnMount>`.
 */
export const READ_MARKER_SUBJECT_RULES: Record<
  ReadMarkerSubject,
  ReadMarkerSubjectRule
> = {
  [ReadMarkerSubject.Task]: {
    readResource: "task",
    markerData: (subjectId) => ({ taskId: subjectId }),
    canRead: async (context, actor, subjectId) =>
      (await context.prisma.task.count({
        where: {
          AND: [{ id: subjectId }, getVisibleTasksWhere(actor)],
          deletedAt: null,
        },
      })) > 0,
    findNewIds: (context, subjectIds, unreadWhere) =>
      findNewTaskIds(context.prisma, subjectIds, unreadWhere, context.now()),
    countNew: (context, actor, unreadWhere) =>
      context.prisma.task.count({
        where: {
          AND: [
            getVisibleTasksWhere(actor),
            getOpenTasksWhere(context.now()),
            unreadWhere,
          ],
        },
      }),
  },

  [ReadMarkerSubject.Event]: {
    readResource: "event",
    markerData: (subjectId) => ({ eventId: subjectId }),
    canRead: async (context, actor, subjectId) =>
      (await context.prisma.event.count({
        where: {
          AND: [
            { id: subjectId },
            buildVisibleEventsWhere(toEventViewer(actor)),
          ],
        },
      })) > 0,
    findNewIds: (context, subjectIds, unreadWhere) =>
      findNewEventIds(context.prisma, subjectIds, unreadWhere, context.now()),
    countNew: (context, actor, unreadWhere) =>
      context.prisma.event.count({
        where: {
          AND: [
            buildVisibleEventsWhere(toEventViewer(actor)),
            getOpenEventsWhere(context.now()),
            unreadWhere,
          ],
        },
      }),
  },
};
