import { prisma } from "@/db";
import { getApplicationContext, toActor } from "@/modules/application";
import { authenticate } from "@/modules/auth/server";
import { getEventTemplateById } from "@/modules/event-templates/queries/getEventTemplateById";
import {
  eventContainerColumns,
  EventContainerKind,
  type EventContainer,
} from "@/modules/events/utils/eventContainer";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  buildEventWikiContext,
  EVENT_WIKI_PAGE_SELECT,
  EVENT_WIKI_POSITION_SELECT,
  pickEventWikiRootPage,
  type EventWikiContext as ContainerlessEventWikiContext,
} from "@sam-monorepo/application";
import { WikiPageNamespace } from "@sam-monorepo/database/client";
import {
  resolveEventWikiPagePermissions,
  type EventWikiViewer,
} from "@sam-monorepo/domain";
import { cache } from "react";

export {
  hasReadableEventWikiRoot,
  type EventWikiContextPage,
  type EventWikiContextPosition,
} from "@sam-monorepo/application";

export interface EventWikiContext extends ContainerlessEventWikiContext {
  /** The event or the template blueprint this briefing belongs to */
  container: EventContainer;
}

/**
 * Loads one container's briefing pages and resolves the current viewer's
 * effective permissions once per request — the container-scoped counterpart
 * of `getWikiContext`. Everything briefing-related (tab gate, tree, page
 * views, actions) derives from this context. Returns null if the viewer may
 * not hold it: unauthenticated, missing `event;read`, an event they cannot
 * see, or a template they have no access to.
 */
export const getEventWikiContext = cache(
  withTrace(
    "getEventWikiContext",
    async (container: EventContainer): Promise<EventWikiContext | null> => {
      switch (container.kind) {
        case EventContainerKind.Event:
          return await loadEventBriefingContext(container);

        case EventContainerKind.Template:
          return await loadTemplateBriefingContext(container);

        default:
          throw new Error(
            `Unknown event container kind: ${container.kind satisfies never}`,
          );
      }
    },
  ),
);

/** See `buildEventWikiContext()` */
const loadEventBriefingContext = async (
  container: EventContainer,
): Promise<EventWikiContext | null> => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const context = await buildEventWikiContext(
    getApplicationContext(),
    await toActor(authentication.session),
    { event_id: container.id },
  );

  return context && { ...context, container };
};

/**
 * A template's briefing is a blueprint, so the per-page event scopes are
 * stored metadata that only takes effect once the tree is copied into an
 * event. Access is decided by the template's own ACL instead: reading the
 * template reads every page of its briefing, editing it edits and
 * administrates them. The scope source ids stay resolved from the real
 * hierarchy so the scope editor keeps showing where a value comes from.
 */
const loadTemplateBriefingContext = async (
  container: EventContainer,
): Promise<EventWikiContext | null> => {
  const templateContext = await getEventTemplateById(container.id);
  if (!templateContext) return null;

  const canEdit =
    templateContext.permissions.canEdit &&
    templateContext.template.deletedAt === null;

  const [positions, allPages] = await Promise.all([
    prisma.eventPosition.findMany({
      where: eventContainerColumns(container),
      select: EVENT_WIKI_POSITION_SELECT,
    }),
    prisma.wikiPage.findMany({
      where: {
        namespace: WikiPageNamespace.EVENT,
        ...eventContainerColumns(container),
      },
      select: EVENT_WIKI_PAGE_SELECT,
    }),
  ]);

  const viewer: EventWikiViewer = {
    isParticipant: false,
    isEventManager: canEdit,
    positionScopeIds: new Set(),
  };

  const resolved = resolveEventWikiPagePermissions(allPages, viewer, {
    frozen: false,
  });
  const permissions = new Map(
    [...resolved].map(([pageId, pagePermissions]) => [
      pageId,
      {
        ...pagePermissions,
        canRead: true,
        canEdit,
        canAdmin: canEdit,
        canUploadImages: canEdit,
        canUploadAttachments: canEdit,
      },
    ]),
  );
  const pages = allPages.filter((page) => page.deletedAt === null);

  return {
    container,
    name: templateContext.template.name,
    event: null,
    positions,
    viewer,
    frozen: false,
    allPages,
    pages,
    pagesById: new Map(allPages.map((page) => [page.id, page])),
    rootPage: pickEventWikiRootPage(pages),
    permissions,
  };
};
