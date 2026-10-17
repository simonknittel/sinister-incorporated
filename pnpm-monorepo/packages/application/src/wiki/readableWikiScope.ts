import type { WikiPageHrefBase } from "@sam-monorepo/wiki-editor/helpers";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import {
  buildEventWikiContext,
  hasReadableEventWikiRoot,
  type EventWikiContext,
  type EventWikiContextPage,
} from "./eventWikiContext.js";
import { buildWikiContext, type WikiContext } from "./wikiContext.js";
import {
  createEventWikiHrefBase,
  GLOBAL_WIKI_HREF_BASE,
} from "./wikiPagePath.js";

export enum ReadableWikiScopeKind {
  Wiki = "wiki",
  Event = "event",
}

export type ReadableWikiScope =
  | {
      readonly kind: ReadableWikiScopeKind.Wiki;
      readonly context: WikiContext;
      readonly hrefBase: WikiPageHrefBase;
    }
  | {
      readonly kind: ReadableWikiScopeKind.Event;
      readonly eventId: string;
      readonly context: EventWikiContext & {
        rootPage: EventWikiContextPage;
      };
      readonly hrefBase: WikiPageHrefBase;
    };

/**
 * The global wiki, or the briefing of an event with the gate of the
 * briefing layout: an event without a briefing, or with a briefing that the
 * actor cannot read, does not exist for the actor.
 *
 * @throws ForbiddenError when the actor does not have `event;read`
 * @throws NotFoundError when the event or its briefing is not visible
 */
export const loadReadableWikiScope = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string | undefined,
): Promise<ReadableWikiScope> => {
  if (eventId === undefined)
    return {
      kind: ReadableWikiScopeKind.Wiki,
      context: await buildWikiContext(context, actor),
      hrefBase: GLOBAL_WIKI_HREF_BASE,
    };

  requirePermission(actor, "event", "read");

  const eventContext = await buildEventWikiContext(context, actor, {
    event_id: eventId,
  });
  if (!eventContext || !hasReadableEventWikiRoot(eventContext))
    throw new NotFoundError("The event or its briefing does not exist");

  return {
    kind: ReadableWikiScopeKind.Event,
    eventId,
    context: eventContext,
    hrefBase: createEventWikiHrefBase(eventId, eventContext.rootPage.id),
  };
};
