import { WikiPageNamespace } from "@sam-monorepo/database/client";
import {
  EventContainerKind,
  getEventContainerOfRow,
  type EventContainer,
  type WikiPageTierPermissions,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import {
  buildEventWikiContext,
  hasReadableEventWikiRoot,
  type EventWikiContext,
  type EventWikiContextPage,
} from "./eventWikiContext.js";
import {
  getAccessibleWikiPage,
  type WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import { buildTemplateWikiContext } from "./templateWikiContext.js";
import {
  buildVariantWikiContext,
  type VariantWikiContext,
} from "./variantWikiContext.js";
import { buildWikiContext, type WikiContext } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

/**
 * The pages that a request works on, with the permissions of the actor and
 * the routes of the pages. The `kind` tells which scope it is. A request
 * loads its scope once and gives it to the helpers that render the page.
 */
export type WikiScope = WikiContext | EventWikiContext | VariantWikiContext;

/** The scope that a page belongs to: variants are views of the global wiki */
export type WikiPageScope = WikiContext | EventWikiContext;

/** Names the scope that `loadWikiScope()` loads */
export type WikiScopeTarget =
  | { readonly kind: WikiScopeKind.Wiki }
  | {
      readonly kind: WikiScopeKind.Briefing;
      readonly container: EventContainer;
    }
  | { readonly kind: WikiScopeKind.Variant; readonly variantId: string };

/** The scope of the target, or the union of all scopes for a union target */
export type WikiScopeOf<Target extends WikiScopeTarget> = Target extends {
  readonly kind: WikiScopeKind.Wiki;
}
  ? WikiContext
  : Target extends { readonly kind: WikiScopeKind.Briefing }
    ? EventWikiContext
    : VariantWikiContext;

/**
 * A scope of `findReadableWikiScope()`: there a briefing has a root page that
 * the actor can read
 */
export type ReadableWikiScopeOf<Target extends WikiScopeTarget> =
  WikiScopeOf<Target> &
    (Target extends { readonly kind: WikiScopeKind.Briefing }
      ? { readonly rootPage: EventWikiContextPage }
      : unknown);

/**
 * The briefing of an event or of an event template. Returns null when the
 * actor cannot hold it (see `buildEventWikiContext()` and
 * `buildTemplateWikiContext()`).
 */
export const buildBriefingWikiContext = (
  context: ApplicationContext,
  actor: Actor,
  container: EventContainer,
): Promise<EventWikiContext | null> =>
  withSpan(context, "buildBriefingWikiContext", () => {
    switch (container.kind) {
      case EventContainerKind.Event:
        return buildEventWikiContext(context, actor, {
          event_id: container.id,
        });

      case EventContainerKind.Template:
        return buildTemplateWikiContext(context, actor, container.id);

      default:
        throw new Error(
          `Unknown event container kind: ${container.kind satisfies never}`,
        );
    }
  });

const loadScope = (
  context: ApplicationContext,
  actor: Actor,
  target: WikiScopeTarget,
): Promise<WikiScope | null> => {
  switch (target.kind) {
    case WikiScopeKind.Wiki:
      return buildWikiContext(context, actor);

    case WikiScopeKind.Briefing:
      return buildBriefingWikiContext(context, actor, target.container);

    case WikiScopeKind.Variant:
      return buildVariantWikiContext(context, actor, target.variantId);

    default:
      throw new Error(`Unknown wiki scope: ${target satisfies never}`);
  }
};

/**
 * The one entry to the wiki scopes. Returns null when the actor cannot hold
 * the scope: a briefing without `event;read`, of an event that the actor
 * cannot see or of a template that the actor cannot read; a variant without
 * the fleet gate, without a linked page or with a linked page that the
 * actor cannot read. The global wiki is never null.
 */
export const loadWikiScope = <const Target extends WikiScopeTarget>(
  context: ApplicationContext,
  actor: Actor,
  target: Target,
): Promise<WikiScopeOf<Target> | null> =>
  withSpan(
    context,
    "loadWikiScope",
    () =>
      loadScope(context, actor, target) as Promise<WikiScopeOf<Target> | null>,
  );

/**
 * The scope of the page: the briefing of its event or event template, or
 * the global wiki. An unknown page id gives the global wiki, whose lookups
 * then give the not-found answer of the caller. Returns null when the actor
 * cannot hold the scope: the caller answers null with the same error as for
 * a page that is missing from the scope, thus an existing page that the
 * actor cannot see looks like an unknown id.
 */
export const loadWikiScopeOfPage = (
  context: ApplicationContext,
  actor: Actor,
  pageId: string,
): Promise<WikiPageScope | null> =>
  withSpan(context, "loadWikiScopeOfPage", async () => {
    const page = await context.prisma.wikiPage.findUnique({
      where: { id: pageId },
      select: { namespace: true, eventId: true, templateId: true },
    });
    if (!page) return buildWikiContext(context, actor);

    switch (page.namespace) {
      case WikiPageNamespace.EVENT: {
        /** The CHECK constraint guarantees one container on EVENT rows */
        const container = getEventContainerOfRow(page);
        if (!container) return null;

        return buildBriefingWikiContext(context, actor, container);
      }

      case WikiPageNamespace.WIKI:
        return buildWikiContext(context, actor);

      default:
        throw new Error(
          `Unknown wiki page namespace: ${page.namespace satisfies never}`,
        );
    }
  });

/**
 * A briefing without a root page that the actor can read does not exist for
 * the actor (see `hasReadableEventWikiRoot()`)
 */
const isHiddenBriefing = (scope: WikiScope | null) =>
  scope?.kind === WikiScopeKind.Briefing && !hasReadableEventWikiRoot(scope);

/**
 * `loadWikiScope()` with the gate of the briefing layout: the gate of the
 * reads that do not render a page of the briefing, for example the search
 * and the tags
 */
export const findReadableWikiScope = async <
  const Target extends WikiScopeTarget,
>(
  context: ApplicationContext,
  actor: Actor,
  target: Target,
): Promise<ReadableWikiScopeOf<Target> | null> => {
  const scope = await loadWikiScope(context, actor, target);
  if (isHiddenBriefing(scope)) return null;

  return scope as ReadableWikiScopeOf<Target> | null;
};

/** The target of the scope inputs of the tRPC procedures */
export const toWikiScopeTarget = ({
  container,
  variantId,
}: {
  readonly container?: EventContainer;
  readonly variantId?: string;
}): WikiScopeTarget => {
  if (container) return { kind: WikiScopeKind.Briefing, container };
  if (variantId) return { kind: WikiScopeKind.Variant, variantId };

  return { kind: WikiScopeKind.Wiki };
};

/**
 * Whether the scope refuses all changes: the briefing of an event that is
 * over. The briefing of a template never freezes. Personal data (favorites,
 * visits) stays writable.
 */
export const isWikiScopeFrozen = (scope: WikiScope) =>
  scope.kind === WikiScopeKind.Briefing && scope.frozen;

/**
 * The page if it exists, is not in the trash and the actor holds the tier
 * in the scope
 *
 * @throws NotFoundError otherwise, without a difference between the cases,
 * thus the existence of a page never leaks
 */
export const requireAccessibleWikiPage = <
  Page extends { readonly id: string; readonly deletedAt: Date | null },
>(
  scope: {
    readonly pagesById: ReadonlyMap<string, Page>;
    readonly permissions: ReadonlyMap<string, WikiPageTierPermissions>;
  },
  pageId: string,
  tier: WikiPageAccessTier,
): Page => {
  const page = getAccessibleWikiPage(scope, pageId, tier);
  if (!page) throw new NotFoundError(WikiErrorMessage.PageNotFound);

  return page;
};
