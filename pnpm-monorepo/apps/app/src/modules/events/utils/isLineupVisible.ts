import { toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import {
  isLineupVisible as isLineupVisibleForActor,
  type EventManageInput,
} from "@sam-monorepo/application";
import type { Event } from "@sam-monorepo/database/client";

/** See `isLineupVisible()` of the application package */
export const isLineupVisible = async (
  event: EventManageInput & Pick<Event, "lineupEnabled">,
) => {
  const { session } = await requireAuthentication();

  return isLineupVisibleForActor(
    await toActor(session),
    event,
    session.discordId,
  );
};
