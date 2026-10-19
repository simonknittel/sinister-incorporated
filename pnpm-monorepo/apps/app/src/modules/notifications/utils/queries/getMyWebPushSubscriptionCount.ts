import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { countOwnWebPushSubscriptions } from "@sam-monorepo/application";
import { cache } from "react";

export const getMyWebPushSubscriptionCount = cache(
  withTrace("getMyWebPushSubscriptionCount", async () =>
    countOwnWebPushSubscriptions(
      getApplicationContext(),
      await getRequestActor(),
    ),
  ),
);
