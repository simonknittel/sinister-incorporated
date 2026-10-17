import { toActor } from "@/modules/application";
import {
  getEffectiveRoles,
  requireAuthentication,
} from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  buildVisibleEventsWhere,
  resolveEventVisibility,
  toEventViewer,
  type EventViewer,
  type EventVisibilityInput,
} from "@sam-monorepo/application";
import type { Prisma } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * The viewer of the visibility rules for the session. The effective roles
 * come from the cache of the request, thus the check makes no query of its
 * own.
 */
export const getEventViewer = cache(
  withTrace("getEventViewer", async (): Promise<EventViewer> => {
    const authentication = await requireAuthentication();
    const citizenId = authentication.session.entity?.id ?? null;

    const [actor, effectiveRoles] = await Promise.all([
      toActor(authentication.session),
      citizenId ? getEffectiveRoles(citizenId) : null,
    ]);

    return toEventViewer(actor, effectiveRoles?.roleIds ?? new Set());
  }),
);

/**
 * Prisma where fragment matching exactly the events the current viewer may
 * see, see `buildVisibleEventsWhere()`
 */
export const getVisibleEventsWhere =
  async (): Promise<Prisma.EventWhereInput> =>
    buildVisibleEventsWhere(await getEventViewer());

/**
 * Single-event visibility check for the current viewer. Callers treat a
 * `false` as "does not exist" (`notFound()`) so restricted events stay fully
 * invisible.
 */
export const canSeeEvent = async (
  event: EventVisibilityInput,
): Promise<boolean> => resolveEventVisibility(event, await getEventViewer());
