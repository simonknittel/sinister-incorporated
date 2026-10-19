import { getApplicationContext, getRequestActor } from "@/modules/application";
import type { EventContainer } from "@/modules/events/utils/eventContainer";
import {
  loadWikiScope,
  WikiScopeKind,
  type EventWikiContext,
} from "@sam-monorepo/application";
import { cache } from "react";

export {
  hasReadableEventWikiRoot,
  type EventWikiContext,
  type EventWikiContextPage,
  type EventWikiContextPosition,
} from "@sam-monorepo/application";

/**
 * Loads one container's briefing pages and resolves the current viewer's
 * effective permissions once per request — the container-scoped counterpart
 * of `getWikiContext`. Everything briefing-related (tab gate, tree, page
 * views, actions) derives from this context. Returns null if the viewer may
 * not hold it: missing `event;read`, an event they cannot see, or a template
 * they have no access to (see `loadWikiScope()`).
 */
export const getEventWikiContext = cache(
  async (container: EventContainer): Promise<EventWikiContext | null> =>
    loadWikiScope(getApplicationContext(), await getRequestActor(), {
      kind: WikiScopeKind.Briefing,
      container,
    }),
);
