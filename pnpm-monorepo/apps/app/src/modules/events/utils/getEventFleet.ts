import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findEventFleet } from "@sam-monorepo/application";
import type { Event } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * See `findEventFleet()`. The pages give the event that `getEventById()`
 * cached, thus `cache` dedupes the calls of one render by its reference.
 */
export const getEventFleet = cache(
  withTrace("getEventFleet", async (event: Pick<Event, "id">) => {
    try {
      return await findEventFleet(
        getApplicationContext(),
        await getRequestActor(),
        { eventId: event.id },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
