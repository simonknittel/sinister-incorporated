import { toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import {
  isAllowedToManageEvent as isActorAllowedToManageEvent,
  type EventManageInput,
} from "@sam-monorepo/application";

/** See `isAllowedToManageEvent()` of the application package */
export const isAllowedToManageEvent = async (event: EventManageInput) => {
  const { session } = await requireAuthentication();

  return isActorAllowedToManageEvent(
    await toActor(session),
    event,
    session.discordId,
  );
};
