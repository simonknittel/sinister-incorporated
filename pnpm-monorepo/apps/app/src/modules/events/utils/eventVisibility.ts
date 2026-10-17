import { getRequestActor } from "@/modules/application";
import {
  buildVisibleEventsWhere,
  resolveEventVisibility,
  toEventViewer,
  type EventVisibilityInput,
} from "@sam-monorepo/application";
import type { Prisma } from "@sam-monorepo/database/client";

/**
 * Prisma where fragment matching exactly the events the current viewer may
 * see, see `buildVisibleEventsWhere()`
 */
export const getVisibleEventsWhere =
  async (): Promise<Prisma.EventWhereInput> =>
    buildVisibleEventsWhere(toEventViewer(await getRequestActor()));

/**
 * Single-event visibility check for the current viewer. Callers treat a
 * `false` as "does not exist" (`notFound()`) so restricted events stay fully
 * invisible.
 */
export const canSeeEvent = async (
  event: EventVisibilityInput,
): Promise<boolean> =>
  resolveEventVisibility(event, toEventViewer(await getRequestActor()));
