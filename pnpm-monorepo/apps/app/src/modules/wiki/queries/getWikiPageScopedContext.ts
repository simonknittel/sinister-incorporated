import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { getApplicationContext, getRequestActor } from "@/modules/application";
import { getBriefingPath } from "@/modules/events/utils/eventContainer";
import { loadWikiScopeOfPage, WikiScopeKind } from "@sam-monorepo/application";
import { WikiScope } from "../utils/wikiPageHref";
import type { EventWikiContext } from "./getEventWikiContext";
import type { WikiContext } from "./getWikiContext";

export type WikiPageScopedContext =
  | { readonly scope: WikiScope.Wiki; readonly context: WikiContext }
  | { readonly scope: WikiScope.Event; readonly context: EventWikiContext };

/**
 * Loads the context matching a page's namespace — the seam that lets one
 * server action serve the global wiki, the event briefings and the briefing
 * blueprints of event templates (see `loadWikiScopeOfPage()`). An unknown
 * page id resolves to the global context, whose lookups then produce the
 * action's usual not-found handling. Returns null when the viewer cannot
 * hold the page's context. Caller contract: answer null with the SAME error
 * the action uses for a page missing from the context — that keeps an
 * existing but inaccessible page indistinguishable from an unknown id.
 */
export const getWikiPageScopedContext = async (
  pageId: string,
): Promise<WikiPageScopedContext | null> => {
  const scope = await loadWikiScopeOfPage(
    getApplicationContext(),
    await getRequestActor(),
    pageId,
  );
  if (!scope) return null;

  switch (scope.kind) {
    case WikiScopeKind.Wiki:
      return { scope: WikiScope.Wiki, context: scope };

    case WikiScopeKind.Briefing:
      return { scope: WikiScope.Event, context: scope };

    default:
      throw new Error(`Unknown wiki page scope: ${scope satisfies never}`);
  }
};

/**
 * The home of the scope: the global wiki, or the briefing of the event or
 * the event template
 */
export const getWikiScopeHomePath = (scoped: WikiPageScopedContext) => {
  switch (scoped.scope) {
    case WikiScope.Event:
      return getBriefingPath(scoped.context.container);

    case WikiScope.Wiki:
      return "/app/wiki";

    default:
      throw new Error(`Unknown wiki scope: ${scoped satisfies never}`);
  }
};

/**
 * Whether the scope rejects mutations: an event briefing freezes entirely
 * once its event is over. A template blueprint never freezes. Per-user
 * metadata (favourites, visits) stays writable.
 */
export const isWikiScopeFrozen = (scoped: WikiPageScopedContext) =>
  scoped.scope === WikiScope.Event && scoped.context.frozen;

/**
 * The answer to a mutation in a frozen scope. The event can end while the
 * page is open, and the page must then show the frozen state. Only for
 * server actions (see rejectConflict).
 */
export const rejectFrozenWikiScope = (formData: FormData) =>
  rejectConflict("Das Event ist bereits vorbei.", formData);
