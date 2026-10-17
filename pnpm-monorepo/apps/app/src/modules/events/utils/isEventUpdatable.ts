import { isEventUpdatable as isEventUpdatableAt } from "@sam-monorepo/application";
import type { Event } from "@sam-monorepo/database/client";

/** See `isEventUpdatable()` of the application package */
export const isEventUpdatable = (event: Pick<Event, "startTime" | "endTime">) =>
  isEventUpdatableAt(event, new Date());
