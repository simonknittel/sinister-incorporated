import { getRequestActor } from "@/modules/application";
import {
  isAllowedToManageEvent as isActorAllowedToManageEvent,
  type EventManageInput,
} from "@sam-monorepo/application";

/** See `isAllowedToManageEvent()` of the application package */
export const isAllowedToManageEvent = async (event: EventManageInput) =>
  isActorAllowedToManageEvent(await getRequestActor(), event);
