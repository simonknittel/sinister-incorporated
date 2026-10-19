import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findOwnNotificationSettings } from "@sam-monorepo/application";
import { cache } from "react";

export const getMyNotificationSettings = cache(
  withTrace("getMyNotificationSettings", async () =>
    findOwnNotificationSettings(
      getApplicationContext(),
      await getRequestActor(),
    ),
  ),
);
