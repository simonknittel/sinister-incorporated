import { getApplicationContext, getRequestActor } from "@/modules/application";
import { findParticipatableAppEvent } from "@sam-monorepo/application";

/**
 * Loads an app event for a participation query of the current viewer. See
 * `findParticipatableAppEvent()`.
 */
export const getParticipatableAppEvent = async (eventId: string) =>
  findParticipatableAppEvent(
    getApplicationContext(),
    await getRequestActor(),
    eventId,
  );
