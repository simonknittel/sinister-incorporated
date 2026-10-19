import { collectWikiPageAncestors } from "@sam-monorepo/domain";
import type { WikiSharedContextPage } from "./wikiContext.js";
import type { WikiScope } from "./wikiScope.js";

/**
 * The titles of the ancestors of a page, from the top down to the direct
 * parent. The ancestors in the trash are not included. An ancestor that the
 * actor cannot read cannot occur: a page gives nothing to an actor who
 * cannot read the page above it.
 */
export const buildVisibleWikiBreadcrumb = (
  scope: WikiScope,
  page: WikiSharedContextPage,
): string[] =>
  collectWikiPageAncestors(scope.pagesById, page)
    .flatMap((ancestorId) => {
      const ancestor = scope.pagesById.get(ancestorId);

      return ancestor &&
        ancestor.deletedAt === null &&
        scope.permissions.get(ancestor.id)?.canRead
        ? [ancestor.title]
        : [];
    })
    .toReversed();
