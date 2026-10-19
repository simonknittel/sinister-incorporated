import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findResolvedEventParticipants } from "@sam-monorepo/application";
import type { Event } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * See `findResolvedEventParticipants()`. The pages give the event that
 * `getEventById()` cached, thus `cache` dedupes the calls of one render by
 * its reference.
 */
export const getParticipants = cache(
  withTrace("getParticipants", async (event: Pick<Event, "id">) => {
    try {
      return await findResolvedEventParticipants(
        getApplicationContext(),
        await getRequestActor(),
        { eventId: event.id },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
