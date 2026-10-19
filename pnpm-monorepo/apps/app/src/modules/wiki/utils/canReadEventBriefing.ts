import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  canReadEventBriefing as canActorReadEventBriefing,
  type EventBriefingGateEvent,
} from "@sam-monorepo/application";

/**
 * Whether the current viewer may read an event's briefing (see
 * `canReadEventBriefing()` of the application package). Callers must have
 * checked `event;read`, like every event list does.
 */
export const canReadEventBriefing = withTrace(
  "canReadEventBriefing",
  async (event: EventBriefingGateEvent) =>
    canActorReadEventBriefing(
      getApplicationContext(),
      await getRequestActor(),
      event,
    ),
);
