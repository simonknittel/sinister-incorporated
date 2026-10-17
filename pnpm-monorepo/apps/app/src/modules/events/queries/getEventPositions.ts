import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findEventPositionTree } from "@sam-monorepo/application";
import type { Event } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * The lineup of one event as a tree of root positions. Split out of
 * `getEventById()` because the tree is four levels deep and only the lineup
 * page renders it, while `getEventById()` runs behind every event subpage.
 * Carries no permission check — the caller resolves the event first.
 */
export const getEventPositions = cache(
  withTrace("getEventPositions", async (eventId: Event["id"]) =>
    findEventPositionTree(getApplicationContext(), eventId),
  ),
);
