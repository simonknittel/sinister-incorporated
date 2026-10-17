import { toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import {
  isAllowedToManagePositions as isActorAllowedToManagePositions,
  type EventManageInput,
} from "@sam-monorepo/application";

/** See `isAllowedToManagePositions()` of the application package */
export const isAllowedToManagePositions = async (event: EventManageInput) => {
  const { session } = await requireAuthentication();

  return isActorAllowedToManagePositions(
    await toActor(session),
    event,
    session.discordId,
  );
};
