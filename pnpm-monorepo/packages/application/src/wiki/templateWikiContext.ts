import { WikiPageNamespace } from "@sam-monorepo/database/client";
import {
  eventContainerColumns,
  resolveEventWikiPagePermissions,
  toTemplateContainer,
  type EventWikiViewer,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { findEventTemplateAccess } from "../eventTemplates/eventTemplateAccess.js";
import {
  EVENT_WIKI_PAGE_SELECT,
  EVENT_WIKI_POSITION_SELECT,
  pickEventWikiRootPage,
  type EventWikiContext,
} from "./eventWikiContext.js";
import { createBriefingWikiHrefBase } from "./wikiPagePath.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

/**
 * The briefing of an event template. It is a blueprint, so the per-page
 * event scopes are stored metadata that only takes effect once the tree is
 * copied into an event. Access is decided by the template's own ACL instead:
 * reading the template reads every page of its briefing, editing it edits
 * and administrates them. The scope source ids stay resolved from the real
 * hierarchy so the scope editor keeps showing where a value comes from.
 * Returns null when the actor cannot read the template.
 */
export const buildTemplateWikiContext = async (
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
): Promise<EventWikiContext | null> => {
  const access = await findEventTemplateAccess(context, actor, templateId, {
    name: true,
  });
  if (!access) return null;

  const canEdit =
    access.permissions.canEdit && access.template.deletedAt === null;
  const container = toTemplateContainer(templateId);

  const [positions, allPages] = await Promise.all([
    context.prisma.eventPosition.findMany({
      where: eventContainerColumns(container),
      select: EVENT_WIKI_POSITION_SELECT,
    }),
    context.prisma.wikiPage.findMany({
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
  const rootPage = pickEventWikiRootPage(pages);

  return {
    kind: WikiScopeKind.Briefing,
    container,
    hrefBase: createBriefingWikiHrefBase(container, rootPage?.id ?? null),
    name: access.template.name,
    event: null,
    positions,
    viewer,
    frozen: false,
    allPages,
    pages,
    pagesById: new Map(allPages.map((page) => [page.id, page])),
    rootPage,
    permissions,
  };
};
