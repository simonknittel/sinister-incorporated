import {
  getApplicationContext,
  getOptionalRequestActor,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { countOwnUnreadOnSiteNotifications } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * Number of unread, unarchived on-site notifications of the current citizen.
 * Archiving an unread notification removes it from this count without
 * touching its read state. The layout of `/app` calls it, thus it gives 0
 * without a session.
 */
export const getUnreadOnSiteNotificationCount = cache(
  withTrace("getUnreadOnSiteNotificationCount", async () => {
    const actor = await getOptionalRequestActor();
    if (!actor) return 0;

    return countOwnUnreadOnSiteNotifications(getApplicationContext(), actor);
  }),
);
