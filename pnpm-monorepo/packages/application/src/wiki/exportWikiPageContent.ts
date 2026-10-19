import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { EMPTY_WIKI_DOCUMENT } from "./wikiContentNormalization.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { canTransferWikiPageContent } from "./wikiPageAdminGuard.js";
import { loadWikiScopeOfPage } from "./wikiScope.js";

export const exportWikiPageContentInputSchema = z.object({
  page_id: idSchema,
});

export type ExportWikiPageContentInput = z.output<
  typeof exportWikiPageContentInputSchema
>;

export interface ExportWikiPageContentOutput {
  /** For the name of the file */
  readonly slug: string;
  /** Tiptap JSON: the file that `importWikiPageContent` takes */
  readonly content: unknown;
}

/**
 * The content of a page as Tiptap JSON, for a download. A read without an
 * audit event. The briefing of an event that is over gives its content too.
 *
 * @throws NotFoundError when the page does not exist, is in the trash or the
 * actor cannot export it: a missing permission does not show that the page
 * exists
 */
export const exportWikiPageContent = (
  context: ApplicationContext,
  actor: Actor,
  input: ExportWikiPageContentInput,
): Promise<ExportWikiPageContentOutput> =>
  withSpan(context, "exportWikiPageContent", async () => {
    const scope = await loadWikiScopeOfPage(context, actor, input.page_id);
    const page = scope?.pagesById.get(input.page_id);
    if (
      !scope ||
      !page ||
      page.deletedAt ||
      !canTransferWikiPageContent(actor, scope, page.id)
    )
      throw new NotFoundError(WikiErrorMessage.PageNotFound);

    const record = await context.prisma.wikiPage.findUnique({
      where: { id: page.id },
      select: { content: true },
    });

    return {
      slug: page.slug,
      content: record?.content ?? EMPTY_WIKI_DOCUMENT,
    };
  });
