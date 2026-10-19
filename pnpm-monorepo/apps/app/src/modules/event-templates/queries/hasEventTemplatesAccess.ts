import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { canAccessEventTemplates } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * Whether the templates section has anything to offer the current viewer.
 * Drives the navigation item and the section's own gate.
 */
export const hasEventTemplatesAccess = cache(
  withTrace("hasEventTemplatesAccess", async () =>
    canAccessEventTemplates(getApplicationContext(), await getRequestActor()),
  ),
);
