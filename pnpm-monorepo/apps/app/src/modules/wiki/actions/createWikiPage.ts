"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import {
  ConflictError,
  createWikiPageInputSchema,
  createWikiPageInScope,
  getAccessibleWikiPage,
  requireCitizen,
  requireWikiPagePlacement,
  WikiPageAccessTier,
  type ActorCitizen,
  type CreatedWikiPage,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import {
  getWikiContext,
  type WikiSharedContextPage,
} from "../queries/getWikiContext";
import {
  getWikiPageScopedContext,
  rejectFrozenWikiScope,
  type WikiPageScopedContext,
} from "../queries/getWikiPageScopedContext";
import { copyWikiPageSubtree } from "../utils/copyWikiPageSubtree";
import { resolveVariantWikiRedirectHref } from "../utils/resolveVariantWikiRedirectHref";
import { getWikiPageRouteHref, WikiScope } from "../utils/wikiPageHref";

const schema = createWikiPageInputSchema
  .pick({ title: true, parent_id: true })
  .extend({
    /** Set when creating from inside a variant embed, for the redirect */
    variant_id: z.cuid().optional(),
    /** Readable page whose content the new page starts with */
    copy_from_page_id: z.cuid2().optional(),
    copy_children: z.boolean(),
  });

export const createWikiPage = createAuthenticatedAction(
  "createWikiPage",
  schema,
  async (formData, authentication, data, t) => {
    const actor = await toActor(authentication.session);
    const toErrorResponse = (error: unknown) =>
      // The only conflict of the action: the event of the briefing is over
      error instanceof ConflictError
        ? rejectFrozenWikiScope(formData)
        : mapApplicationErrorToActionResponse(error, { formData, t });

    /**
     * The parent decides the scope: an event page's children live in the
     * same event wiki. Top-level pages exist only in the global wiki — the
     * event wikis' single top-level page is the seeded root — so the
     * no-parent case wraps the global context into the same scoped shape.
     */
    const scoped: WikiPageScopedContext | null = data.parent_id
      ? await getWikiPageScopedContext(data.parent_id)
      : await getWikiContext().then((context) =>
          context ? { scope: WikiScope.Wiki, context } : null,
        );

    /**
     * The copy path below stays in the app, thus the action checks the
     * placement itself before it; the use case checks it again. A different
     * user or tab can have deleted the parent before, and a context that the
     * viewer cannot hold gets the same answer (see getWikiPageScopedContext).
     */
    let citizen: ActorCitizen;
    let targetScoped: WikiPageScopedContext;
    try {
      citizen = requireCitizen(actor);
      targetScoped = requireWikiPagePlacement(actor, scoped, data.parent_id);
    } catch (error) {
      return toErrorResponse(error);
    }

    /**
     * With a "copy from" source the new page is a copy of that page —
     * optionally with its readable subtree — instead of an empty one. The
     * source only takes read access and is resolved in its own scope; see
     * copyWikiPageSubtree for the copy semantics.
     */
    if (data.copy_from_page_id) {
      const parent = data.parent_id
        ? targetScoped.context.pagesById.get(data.parent_id)
        : null;
      const sourceScoped = await getWikiPageScopedContext(
        data.copy_from_page_id,
      );
      const sourcePage = sourceScoped
        ? getAccessibleWikiPage<WikiSharedContextPage>(
            sourceScoped.context,
            data.copy_from_page_id,
            WikiPageAccessTier.Read,
          )
        : null;
      if (!sourceScoped || !sourcePage) {
        /**
         * A different user deleted the source page or took the read access
         * away before, and the page must show it
         */
        return rejectConflict(t("Common.notFound"), formData);
      }

      const { root, copiedPages } = await copyWikiPageSubtree({
        sourceScoped,
        sourcePage,
        includeChildren: data.copy_children,
        targetScoped,
        destination: {
          kind: "newPage",
          parentId: data.parent_id,
          rootTitle: data.title,
        },
        createdByEntityId: citizen.id,
      });

      refresh();

      await createAuditEvents(
        copiedPages.map((copiedPage) => ({
          type: AuditEventType.WIKI_PAGE_COPIED as const,
          data: {
            pageId: copiedPage.id,
            eventId: parent?.eventId ?? undefined,
            sourcePageId: copiedPage.sourcePageId,
            title: copiedPage.title,
            parentId: copiedPage.parentId,
            rootPageId: root.id,
          },
          createdById: authentication.session.user.id,
        })),
      );

      const copyVariantHref = await resolveVariantWikiRedirectHref(
        targetScoped,
        data.variant_id,
        root,
        data.parent_id ?? null,
      );
      /** A copied page is never an event root page */
      redirect(
        copyVariantHref ??
          getWikiPageRouteHref({
            id: root.id,
            slug: root.slug,
            eventId: parent?.eventId ?? null,
            templateId: parent?.templateId ?? null,
          }),
      );
    }

    let page: CreatedWikiPage;
    try {
      page = await createWikiPageInScope(
        getApplicationContext(),
        actor,
        { title: data.title, parent_id: data.parent_id },
        targetScoped,
      );
    } catch (error) {
      return toErrorResponse(error);
    }

    refresh();

    const variantHref = await resolveVariantWikiRedirectHref(
      targetScoped,
      data.variant_id,
      page,
      data.parent_id ?? null,
    );
    /** A newly created page is never an event root page */
    redirect(variantHref ?? getWikiPageRouteHref(page));
  },
  {
    parseFormData: (formData) => ({
      title: formData.get("title"),
      // An empty value creates a top-level page
      parent_id: formData.get("parentId") || undefined,
      variant_id: formData.get("variantId") || undefined,
      // An empty value creates an empty page
      copy_from_page_id: formData.get("copyFromPageId") || undefined,
      copy_children: formData.get("copyChildren") === "1",
    }),
  },
);
