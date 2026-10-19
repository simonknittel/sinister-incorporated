import { toEventContainer } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { buildWikiContext } from "./wikiContext.js";
import {
  buildBriefingWikiContext,
  isHiddenBriefing,
  type WikiPageScope,
} from "./wikiScope.js";

/**
 * The scope of the MCP tools: the global wiki, or the briefing of an event
 * with the gate of the briefing layout. An event without a briefing, or with
 * a briefing that the actor cannot read, does not exist for the actor. The
 * briefings of the event templates are not available.
 *
 * @throws ForbiddenError when the actor does not have `event;read`
 * @throws NotFoundError when the event or its briefing is not visible
 */
export const loadReadableWikiScope = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string | undefined,
): Promise<WikiPageScope> => {
  if (eventId === undefined) return buildWikiContext(context, actor);

  requirePermission(actor, "event", "read");

  const briefing = await buildBriefingWikiContext(
    context,
    actor,
    toEventContainer(eventId),
  );
  if (!briefing || isHiddenBriefing(briefing))
    throw new NotFoundError("The event or its briefing does not exist");

  return briefing;
};
